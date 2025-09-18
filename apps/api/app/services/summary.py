"""Summary service using OpenAI Agents SDK with Azure OpenAI"""

import asyncio
import contextlib
import json
import logging
import re
from enum import Enum
from types import MappingProxyType

from agents import RunConfig, Runner, RunResult
from fastapi import HTTPException

from ..agents.medications import get_agent as med_grouping_agent
from ..agents.medications_enrichment import get_agent as med_enrichment_agent
from ..config import settings
from ..dependencies.context import RequestContext
from ..services.azure_openai import create_azure_openai_client
from ..services.mcp_client import get_vista_mcp_client

logger = logging.getLogger(__name__)

WORKFLOW_NAME = "medication_problem_grouping"
MAX_TURNS = 5


class SummaryService:
    """Service for generating predefined summaries using OpenAI Agents SDK"""

    class SummaryType(Enum):
        MEDICATIONS = "medications"

    AGENTS = MappingProxyType(
        {
            SummaryType.MEDICATIONS: (
                med_grouping_agent(),
                med_enrichment_agent(),
            ),
        }
    )

    def __init__(self):
        """Initialize chat service with Azure OpenAI client"""
        # Create and set Azure OpenAI client
        _ = create_azure_openai_client()

    async def generate_summary(
        self,
        type: SummaryType,
        context: RequestContext,
    ) -> str:
        # Agent SDK will log its own activity
        vista_mcp = None

        # Extract patient context
        patient = context.patient
        patient_icn = None
        patient_station = None
        if patient:
            patient_icn = patient.icn
            patient_station = patient.station
        if not patient_icn:
            raise HTTPException(
                status_code=400,
                detail="Patient ICN is required for medication summaries.",
            )

        try:
            # Apply rate limit delay if configured (environment-specific)
            if settings.rate_limit_delay_ms > 0:
                await asyncio.sleep(settings.rate_limit_delay_ms / 1000)

            # Get auth params from context
            jwt_token, user_duz = context.get_mcp_params()

            # Get MCP client for connection
            vista_mcp = get_vista_mcp_client(jwt_token, user_duz=user_duz)
            # Connect MCP server before using it
            await vista_mcp.connect()

            # Get and run agents
            agent_result: RunResult | None = None
            for agent in self.AGENTS[type]:
                # Attach MCP server to agent
                agent.mcp_servers = [vista_mcp]

                # Configure run settings
                run_config = RunConfig(
                    # Enable workflow tracing with a name
                    workflow_name=WORKFLOW_NAME,
                    # Include input/output data in traces (controlled by environment)
                    # NOTE: Set to False in production if handling PHI/sensitive data
                    trace_include_sensitive_data=settings.trace_include_sensitive_data,
                    # Add patient context as metadata
                    trace_metadata={
                        "patient_icn": patient_icn,
                        "patient_station": patient_station,
                        "user_duz": user_duz,
                    }
                    if patient_icn
                    else {},
                )

                input_json = json.dumps(
                    {"patient_icn": patient_icn}
                    | ({"data": agent_result.final_output} if agent_result else {})
                )

                agent_result = await Runner.run(
                    agent, input=input_json, max_turns=MAX_TURNS, run_config=run_config
                )

            if agent_result is None:
                raise HTTPException(
                    status_code=500,
                    detail="An internal server error occurred. Please try again later.",
                )

            # model often wants to return MD style quotes, strip if they are there
            return re.sub(
                r"^```json|```$", "", agent_result.final_output, flags=re.MULTILINE
            ).strip()

        except Exception as e:
            logger.error(f"Stream error: {e!s}", exc_info=True)
            # Always return a generic error to the client, log details internally.
            error_message = "An internal server error occurred. Please try again later."
            return json.dumps(error_message)
        finally:
            # Cleanup MCP connection
            if vista_mcp is not None:
                with contextlib.suppress(Exception):
                    await vista_mcp.cleanup()

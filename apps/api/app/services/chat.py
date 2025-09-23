"""Chat service using OpenAI Agents SDK with Azure OpenAI"""

import asyncio
import contextlib
import json
import logging
from collections.abc import AsyncGenerator

from agents import RunConfig, Runner
from openai.types.responses import ResponseTextDeltaEvent

from ..agents.orchestrator import get_orchestrator_agent
from ..config import settings
from ..dependencies.context import RequestContext
from ..models.chat import ChatMessage
from ..services.azure_openai import create_azure_openai_client
from ..services.mcp_client import get_vista_mcp_client

logger = logging.getLogger(__name__)


class ChatService:
    """Service for handling chat interactions using OpenAI Agents SDK"""

    def __init__(self):
        """Initialize chat service with Azure OpenAI client"""
        # Create and set Azure OpenAI client
        _ = create_azure_openai_client()

    async def generate_stream(
        self,
        messages: list[ChatMessage],
        context: RequestContext,
        patient_dfn: str | None = None,  # Backward compatibility
    ) -> AsyncGenerator[str]:
        """Generate a streaming response"""
        last_user_message = ""
        patient = context.patient

        logger.info(f"Patient context: {patient}")
        for msg in reversed(messages):
            if msg.role == "user":
                last_user_message = msg.content
                break

        # Extract patient context
        patient_icn = None
        patient_dfn_local = patient_dfn  # Use local var to avoid overwriting parameter
        patient_station = None
        if patient:
            patient_icn = patient.icn
            patient_dfn_local = patient.dfn
            patient_station = patient.station
        elif patient_dfn:
            # Legacy support - use patient_dfn parameter
            patient_icn = patient_dfn  # Treat as ICN for now
            patient_dfn_local = patient_dfn

        # Enhance message with patient context if provided
        if patient:
            enhanced_message = (
                f"Patient Context:\n"
                f"ICN: {patient.icn}\n"
                f"DFN: {patient.dfn or 'N/A'}\n"
                f"Station: {patient.station or 'Unknown'}\n"
                f"Name: {patient.firstName} {patient.lastName}\n\n"
                f"{last_user_message}"
            )
        elif patient_icn:
            enhanced_message = f"Patient ICN: {patient_icn}\n{last_user_message}"
        else:
            enhanced_message = last_user_message

        vista_mcp = None

        # Get auth params from context
        jwt_token, user_duz, station_from_context = context.get_mcp_params()
        station = patient_station or station_from_context

        try:
            if settings.rate_limit_delay_ms > 0:
                await asyncio.sleep(settings.rate_limit_delay_ms / 1000)

            orchestrator = get_orchestrator_agent(
                with_mcp=False,  # Don't create MCP client in orchestrator
                jwt_token=jwt_token,
                patient_context={
                    "icn": patient_icn,
                    "dfn": patient_dfn_local,
                    "station": patient_station,
                    "duz": user_duz,
                }
                if patient_icn
                else None,
            )

            # Get MCP client and connect it after creating orchestrator
            vista_mcp = get_vista_mcp_client(
                jwt_token,
                user_duz=user_duz,
                station=station,
            )
            await vista_mcp.connect()

            # Add MCP server to orchestrator after connecting
            orchestrator.mcp_servers = [vista_mcp]

            # Configure run settings
            run_config = RunConfig(
                # Enable workflow tracing with a name
                workflow_name="vista_patient_query",
                # Include input/output data in traces (controlled by environment)
                # NOTE: Set to False in production if handling PHI/sensitive data
                trace_include_sensitive_data=settings.trace_include_sensitive_data,
                # Add patient context as metadata
                trace_metadata={
                    "patient_icn": patient_icn,
                    "patient_dfn": patient_dfn_local,
                    "patient_station": patient_station,
                    "user_duz": user_duz,
                }
                if patient_icn
                else {},
            )

            # Use orchestrator agent with MCP tools
            result = Runner.run_streamed(
                orchestrator,
                input=enhanced_message,
                max_turns=3,  # Allow multiple turns for MCP tool calls
                run_config=run_config,
            )

            async for event in result.stream_events():
                if event.type == "raw_response_event" and isinstance(
                    event.data, ResponseTextDeltaEvent
                ):
                    # Properly escape the content for JSON
                    content = json.dumps(event.data.delta)
                    yield f"0:{content}\n"

        except Exception as e:
            logger.error(f"Stream error: {e!s}", exc_info=True)
            # All error details are logged; users get only generic messages.
            if (
                settings.rate_limit_delay_ms > 0
                or "rate limit" in str(e).lower()
                or "429" in str(e)
            ):
                # Log details internally for troubleshooting.
                logger.warning(
                    "Azure rate/token limit hit - "
                    "likely due to large number of MCP tools"
                )
                error_message = (
                    "Azure OpenAI limit exceeded. "
                    "Try a simpler query or contact support. "
                    "If the problem persists, your administrator may need to "
                    "increase Azure quotas."
                )
            elif "Azure support request" in str(
                e
            ) or "An error occurred while processing your request" in str(e):
                # Log details but do not send request ID or specifics to the client.
                logger.error("Azure service error encountered.")
                error_message = (
                    "Azure OpenAI service error. Try disabling Vista MCP tools or "
                    "use a simpler query. "
                    "If the issue persists, contact support."
                )
            else:
                # For all other errors, do not expose internal details to the client.
                error_message = (
                    "An internal server error occurred. Please try again later."
                )
            # Always yield a fully generic error message to the client.
            yield f"3:{json.dumps(error_message)}\n"
        finally:
            # Cleanup MCP connection
            if vista_mcp is not None:
                with contextlib.suppress(Exception):
                    await vista_mcp.cleanup()

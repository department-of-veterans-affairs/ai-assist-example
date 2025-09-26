"""Medication summary service layer."""

from __future__ import annotations

import contextlib
import json
import logging
import re
from enum import Enum
from typing import TYPE_CHECKING, TypeVar, cast

from agents import RunConfig, Runner, RunResult
from fastapi import HTTPException
from pydantic import BaseModel

from ..agents import (
    MedicationRunContext,
    build_medication_enrichment_agent,
    build_medication_grouping_agent,
    build_medication_tools,
)
from ..config import settings
from ..models.summaries import (
    MedicationGroupingOutput,
    MedicationSummary,
    MedicationSummaryResponse,
    SummariesRequest,
)
from .azure_openai import create_azure_openai_client
from .azure_rate_limiter import AzureRateLimiter
from .mcp_client import get_vista_mcp_client

if TYPE_CHECKING:
    from agents import Agent

    from ..dependencies.context import RequestContext

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

JSON_CONTENT_MATCH_PATTERN = re.compile(
    r"(?:\s*```json\s*)?(.*?)(?:\s*```\s*)?$", re.DOTALL
)


def extract_json_content(text: str) -> str:
    """Extract JSON content, handling optional markdown code blocks."""
    input = text.strip()
    match = JSON_CONTENT_MATCH_PATTERN.search(input)
    result = (
        extracted_json
        if (match and len(extracted_json := match.group(1)) > 0)
        else input
    )
    return result


class SummariesService:
    """Generate clinical summaries using the OpenAI Agents SDK."""

    _rate_limiter: AzureRateLimiter

    class SummaryType(str, Enum):
        MEDICATION = "medication"

    def __init__(self) -> None:
        self._rate_limiter = AzureRateLimiter(
            max_concurrency=settings.azure_openai_max_concurrency,
            max_attempts=settings.azure_openai_rate_limit_max_attempts,
            base_delay_seconds=settings.azure_openai_rate_limit_base_delay_ms / 1000,
            jitter_seconds=settings.azure_openai_rate_limit_jitter_ms / 1000,
        )

    async def generate_summary(
        self,
        summary_type: SummaryType,
        request: SummariesRequest,
        context: RequestContext,
    ) -> MedicationSummaryResponse:
        _ = summary_type  # prevent unused-parameter warnings; only MEDICATION supported
        summary = await self._generate_medication_summary(request, context)
        return MedicationSummaryResponse(summary_type="medication", data=summary)

    async def _generate_medication_summary(
        self,
        request: SummariesRequest,
        context: RequestContext,
    ) -> MedicationSummary:
        patient = request.patient

        if not patient or not patient.icn:
            raise HTTPException(
                status_code=400,
                detail="Patient ICN is required to generate a medication summary.",
            )

        vista_context = context.require_vista_context(
            logger=logger,
            require_icn=True,
            endpoint="medication_summary",
        )

        jwt_token = vista_context.token
        user_duz = vista_context.duz
        station_from_context = vista_context.station

        azure_client = create_azure_openai_client()
        station = patient.station or station_from_context

        vista_mcp = get_vista_mcp_client(
            jwt_token,
            user_duz=user_duz,
            station=station,
        )
        logger.info(
            "Initialized Vista MCP client for summary (jwt=%s, duz=%s, station=%s)",
            "present" if jwt_token else "missing",
            user_duz or "missing",
            station or "missing",
        )
        await vista_mcp.connect()

        tools = build_medication_tools()
        run_context = MedicationRunContext(
            vista_mcp=vista_mcp,
            patient_icn=patient.icn,
            station=station,
            user_duz=user_duz,
            options=request.options.model_dump(),
            max_pages=4,
            page_size=100,
        )

        metadata = {
            "patient_icn": patient.icn,
            "patient_station": station,
            "user_duz": user_duz,
        }

        try:
            grouping_agent = build_medication_grouping_agent(
                openai_client=azure_client,
                tools=[
                    tools["fetch_medications"],
                    tools["fetch_problems"],
                ],
            )

            grouping_result = await self._run_agent(
                agent=grouping_agent,
                input_payload=json.dumps(
                    {
                        "task": "group_medications",
                        "patient_icn": patient.icn,
                        "patient_station": station,
                    }
                ),
                run_context=run_context,
                metadata=metadata,
                workflow_name="medication_summary.grouping",
            )

            grouping_output = self._require_output(
                grouping_result, MedicationGroupingOutput
            )
            run_context.grouping_output = grouping_output

            enrichment_agent = build_medication_enrichment_agent(
                openai_client=azure_client,
                tools=[
                    tools["fetch_labs"],
                    tools["fetch_vitals"],
                ],
            )

            grouping_output_dict = cast(
                "dict[str, object]", grouping_output.model_dump()
            )

            enrichment_result = await self._run_agent(
                agent=enrichment_agent,
                input_payload=json.dumps(
                    {
                        "task": "enrich_medication_summary",
                        "medication_groups": grouping_output_dict,
                    }
                ),
                run_context=run_context,
                metadata=metadata,
                workflow_name="medication_summary.enrichment",
            )

            summary = self._require_output(enrichment_result, MedicationSummary)
            return summary
        finally:
            with contextlib.suppress(Exception):
                await vista_mcp.cleanup()

    async def _run_agent(
        self,
        *,
        agent: Agent[MedicationRunContext],
        input_payload: str,
        run_context: MedicationRunContext,
        metadata: dict[str, str | None],
        workflow_name: str,
    ) -> RunResult:
        async def _execute() -> RunResult:
            return await Runner.run(
                agent,
                input=input_payload,
                context=run_context,
                max_turns=10,
                run_config=RunConfig(
                    workflow_name=workflow_name,
                    trace_include_sensitive_data=settings.trace_include_sensitive_data,
                    trace_metadata={k: v for k, v in metadata.items() if v is not None},
                ),
            )

        return await self._rate_limiter.run(_execute)

    @staticmethod
    def _require_output(result: RunResult, model_type: type[T]) -> T:
        final_output = extract_json_content(result.final_output)

        try:
            output_obj: T = model_type.model_validate_json(final_output)
            if not isinstance(output_obj, model_type):
                raise HTTPException(
                    status_code=500,
                    detail="Agent run did not return the expected structured output.",
                )
            return output_obj
        except Exception as e:
            # Log the actual output for debugging
            logger.error(f"Failed to parse agent output: {final_output}")
            logger.error(f"Parse error: {e!s}")

            # Check if the output is an error message from the AI
            if (
                "unable to" in final_output.lower()
                or "error" in final_output.lower()
                or "failed" in final_output.lower()
            ):
                raise HTTPException(
                    status_code=503,
                    detail=f"Service unavailable: {final_output[:200]}",
                ) from e

            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse agent response: {e}\n{final_output}",
            ) from e

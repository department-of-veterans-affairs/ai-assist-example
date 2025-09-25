"""Factory for the medication enrichment agent."""

from __future__ import annotations

import json
from pathlib import Path
from typing import TYPE_CHECKING

from agents import Agent, FunctionTool, ModelSettings, OpenAIChatCompletionsModel

from ..config import settings
from ..models.summaries import MedicationSummary
from .context import MedicationRunContext

if TYPE_CHECKING:
    from collections.abc import Sequence

    from openai import AsyncAzureOpenAI

PROMPT_PATH = (
    Path(__file__).resolve().parents[1] / "prompts" / "medication_enrichment.md"
)


def build_medication_enrichment_agent(
    *,
    openai_client: AsyncAzureOpenAI,
    tools: Sequence[FunctionTool],
) -> Agent[MedicationRunContext]:
    """Create the medication enrichment agent."""

    instructions = (
        PROMPT_PATH.read_text(encoding="utf-8")
        + "\n\n"
        + "Output should be a JSON object with the following schema:\n\n"
        + json.dumps(MedicationSummary.model_json_schema())
    )

    return Agent[MedicationRunContext](
        name="MedicationEnrichmentAgent",
        instructions=instructions,
        model=OpenAIChatCompletionsModel(
            model=settings.azure_openai_deployment_name,
            openai_client=openai_client,
        ),
        tools=list(tools),
        model_settings=ModelSettings(
            temperature=0.15,
            top_p=0.1,
            max_tokens=4096,
            parallel_tool_calls=False,
        ),
    )

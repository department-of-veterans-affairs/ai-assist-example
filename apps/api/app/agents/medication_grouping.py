"""Factory for the medication grouping agent."""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

from agents import Agent, FunctionTool, ModelSettings, OpenAIChatCompletionsModel

from ..config import settings
from ..models.summaries import MedicationGroupingOutput
from .context import MedicationRunContext

if TYPE_CHECKING:
    from collections.abc import Sequence

    from openai import AsyncAzureOpenAI

PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "medication_grouping.md"


def build_medication_grouping_agent(
    *,
    openai_client: AsyncAzureOpenAI,
    tools: Sequence[FunctionTool],
) -> Agent[MedicationRunContext]:
    """Create the medication grouping agent."""

    instructions = PROMPT_PATH.read_text(encoding="utf-8")

    return Agent[MedicationRunContext](
        name="MedicationGroupingAgent",
        instructions=instructions,
        model=OpenAIChatCompletionsModel(
            model=settings.azure_openai_deployment_name,
            openai_client=openai_client,
        ),
        tools=list(tools),
        output_type=MedicationGroupingOutput,
        model_settings=ModelSettings(
            temperature=0.2,
            top_p=0.1,
            max_tokens=1400,
            parallel_tool_calls=False,
        ),
    )

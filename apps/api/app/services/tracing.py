"""LangSmith tracing configuration for OpenAI Agents SDK"""

import logging
import os

from ..config import settings

logger = logging.getLogger(__name__)


def initialize_langsmith_tracing() -> None:
    """
    Initialize LangSmith tracing for OpenAI Agents SDK.

    This function configures the tracing processor for the OpenAI Agents SDK
    to send traces to LangSmith when enabled via environment variables.
    """
    # Check for conflicting environment variable
    if os.environ.get("OPENAI_AGENTS_DISABLE_TRACING") == "1":
        logger.warning(
            "OPENAI_AGENTS_DISABLE_TRACING is set to 1, which will prevent "
            + "LangSmith tracing. Please remove or set it to 0 in your .env file."
        )
        # Remove the conflicting setting
        _ = os.environ.pop("OPENAI_AGENTS_DISABLE_TRACING", None)

    if not settings.langsmith_tracing:
        logger.info("LangSmith tracing is disabled")
        return

    if not settings.langsmith_api_key:
        logger.warning(
            "LangSmith tracing is enabled but LANGSMITH_API_KEY is not set. "
            + "Tracing will be disabled."
        )
        return

    try:
        # Import here to avoid dependency issues when LangSmith is not needed
        from agents import set_trace_processors
        from langsmith.wrappers import OpenAIAgentsTracingProcessor

        # Set environment variables for LangSmith
        os.environ["LANGSMITH_API_KEY"] = settings.langsmith_api_key
        os.environ["LANGSMITH_PROJECT"] = settings.langsmith_project
        os.environ["LANGCHAIN_TRACING"] = "true"

        # Also set LANGCHAIN_ENDPOINT if not already set
        if "LANGCHAIN_ENDPOINT" not in os.environ:
            os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"

        # Configure the tracing processor
        processor = OpenAIAgentsTracingProcessor()
        set_trace_processors([processor])

        logger.info(
            f"LangSmith tracing initialized for project: {settings.langsmith_project}"
        )
    except ImportError as e:
        logger.error(
            f"Failed to import LangSmith dependencies: {e}. "
            + "Make sure 'langsmith[openai-agents]' is installed."
        )
    except Exception as e:
        logger.error(f"Failed to initialize LangSmith tracing: {e}")

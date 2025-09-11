import logging
from pathlib import Path
from typing import TYPE_CHECKING

from agents import Agent, OpenAIChatCompletionsModel

if TYPE_CHECKING:
    from agents.mcp import MCPServer


from ..config import settings
from ..services.azure_openai import create_azure_openai_client
from ..services.mcp_client import get_vista_mcp_client

logger = logging.getLogger(__name__)
_agent_instance: Agent | None = None

PROMPT_FILE = (
    Path(__file__).parent / ".." / "prompts" / "medication-problem-grouping.md"
)


def get_agent() -> Agent:
    global _agent_instance
    if _agent_instance is not None:
        return _agent_instance

    try:
        # Get MCP client (will be created if needed)
        vista_mcp = get_vista_mcp_client()
        mcp_servers: list[MCPServer] = [vista_mcp]
    except Exception as e:
        logger.warning(f"Failed to initialize MCP client: {e}.")
        raise e

    try:
        client = create_azure_openai_client()
    except Exception as e:
        logger.warning(f"Failed to initialize Azure OpenAI client: {e}.")
        raise e

    with PROMPT_FILE.open("r") as prompt_file:
        _agent_instance = Agent(
            instructions=prompt_file.read(),
            name="Vista Clinical Assistant",
            model=OpenAIChatCompletionsModel(
                model=settings.azure_openai_deployment_name,
                openai_client=client,
            ),
            mcp_servers=mcp_servers,
        )
    return _agent_instance

"""Main orchestrator agent for Vista patient queries."""

from typing import TYPE_CHECKING

from agents import Agent, OpenAIChatCompletionsModel

from ..config import settings

if TYPE_CHECKING:
    from agents.mcp import MCPServer

# Keep instructions in a constant for maintainability
ORCHESTRATOR_INSTRUCTIONS = """You are a VA clinical assistant for patient queries.

You have access to Vista patient data tools that will be auto-discovered.
The patient DFN will be provided with each query.

For now, handle simple direct queries like:
- "What are the current vitals?"
- "Show me recent labs"
- "What medications is the patient on?"
- "List current diagnoses"
- "Show recent consultations"

Simply call the appropriate MCP tool and return the results in a clear, concise format.
Focus on providing clinically relevant information.

Always confirm you have the patient DFN before making any tool calls.
If no patient DFN is provided, ask for it first."""

# Global orchestrator instance
_orchestrator_instance: Agent | None = None


def get_orchestrator_agent(with_mcp: bool = True) -> Agent:
    """
    Get or create the main orchestrator agent.

    Args:
        with_mcp: Whether to include MCP server connection.
            Set to False for testing without MCP.

    Returns:
        Agent: Configured orchestrator agent with or without Vista MCP tools
    """
    global _orchestrator_instance

    # Return existing instance only if MCP requirement matches
    if _orchestrator_instance is not None and with_mcp:
        return _orchestrator_instance

    mcp_servers: list[MCPServer]
    if with_mcp:
        try:
            from ..services.mcp_client import get_vista_mcp_client

            # Get MCP client (will be created if needed)
            vista_mcp = get_vista_mcp_client()
            mcp_servers = [vista_mcp]
        except Exception as e:
            import logging

            logging.getLogger(__name__).warning(
                f"Failed to initialize MCP client: {e}. Running without MCP tools."
            )
            mcp_servers = []
    else:
        mcp_servers = []

    from ..services.azure_openai import create_azure_openai_client
    
    client = create_azure_openai_client()
    
    agent = Agent(
        name="Vista Clinical Assistant",
        instructions=ORCHESTRATOR_INSTRUCTIONS
        + (
            "\n\nNote: MCP tools are not available. "
            + "I cannot fetch patient data directly."
            if not mcp_servers
            else ""
        ),
        model=OpenAIChatCompletionsModel(
            model=settings.azure_openai_deployment_name,
            openai_client=client,
        ),
        mcp_servers=mcp_servers,
    )

    if with_mcp and mcp_servers:
        _orchestrator_instance = agent

    return agent

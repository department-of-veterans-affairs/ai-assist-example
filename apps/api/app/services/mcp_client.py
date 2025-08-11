"""Vista MCP Server client service."""

import logging

from agents.mcp import MCPServerStreamableHttp, MCPServerStreamableHttpParams

from ..config import settings

logger = logging.getLogger(__name__)

# Global instance, initialized on first use
_vista_mcp_instance: MCPServerStreamableHttp | None = None


def get_vista_mcp_client() -> MCPServerStreamableHttp:
    """
    Get Vista MCP client configured to use Streamable HTTP transport.

    Returns:
        MCPServerStreamableHttp: Configured MCP server instance
    """
    global _vista_mcp_instance

    if _vista_mcp_instance is not None:
        return _vista_mcp_instance

    try:
        logger.info(
            f"Initializing Vista MCP client with URL: {settings.vista_mcp_server_url}"
        )

        params: MCPServerStreamableHttpParams = {
            "url": settings.vista_mcp_server_url,
        }

        if settings.vista_api_token:
            params["headers"] = {"Authorization": f"Bearer {settings.vista_api_token}"}

        _vista_mcp_instance = MCPServerStreamableHttp(
            params=params,
            name="vista-mcp",
            cache_tools_list=True,
        )

        logger.info("Vista MCP client initialized successfully (Streamable HTTP)")
        return _vista_mcp_instance

    except Exception as e:
        logger.error(f"Error initializing MCP server: {e}")
        raise


# The global MCP client instance is managed by _vista_mcp_instance
# and only initialized on first use.

"""Vista MCP Server client service."""

import logging

from agents.mcp import MCPServerStreamableHttp, MCPServerStreamableHttpParams

from ..config import settings

logger = logging.getLogger(__name__)

# Global instance, initialized on first use
_vista_mcp_instance: MCPServerStreamableHttp | None = None


def get_vista_mcp_client(jwt_token: str | None = None) -> MCPServerStreamableHttp:
    """
    Get Vista MCP client configured to use Streamable HTTP transport.

    Args:
        jwt_token: Optional JWT token for authentication

    Returns:
        MCPServerStreamableHttp: Configured MCP server instance
    """
    global _vista_mcp_instance

    # If we have a JWT token or no existing instance, create new one
    if jwt_token or _vista_mcp_instance is None:
        try:
            logger.info(
                f"Initializing Vista MCP client with URL: "
                f"{settings.vista_mcp_server_url}"
            )

            params: MCPServerStreamableHttpParams = {
                "url": settings.vista_mcp_server_url,
            }

            # Add JWT token if provided
            if jwt_token:
                params["headers"] = {"Authorization": f"Bearer {jwt_token}"}
                logger.info("Using JWT authentication for MCP client")
            else:
                logger.info("No JWT token provided for MCP client")

            new_instance = MCPServerStreamableHttp(
                params=params,
                name="vista-mcp",
                cache_tools_list=True,
            )

            # Only cache if no JWT (static config), otherwise return new instance
            if not jwt_token:
                _vista_mcp_instance = new_instance

            logger.info("Vista MCP client initialized successfully (Streamable HTTP)")
            return new_instance

        except ImportError as e:
            logger.error(f"MCP module import error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error initializing MCP server: {e}")
            raise

    return _vista_mcp_instance


# The global MCP client instance is managed by _vista_mcp_instance
# and only initialized on first use.

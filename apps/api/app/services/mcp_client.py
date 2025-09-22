"""Vista MCP Server client service."""

import logging

from agents.mcp import MCPServerStreamableHttp, MCPServerStreamableHttpParams

from ..config import settings

logger = logging.getLogger(__name__)

# Global instance, initialized on first use
_vista_mcp_instance: MCPServerStreamableHttp | None = None


def get_vista_mcp_client(
    jwt_token: str | None = None,
    *,
    user_duz: str | None = None,
    station: str | None = None,
) -> MCPServerStreamableHttp:
    """
    Get Vista MCP client configured to use Streamable HTTP transport.

    Args:
        jwt_token: Optional JWT token for authentication
        user_duz: Optional DUZ for the current Vista context
        station: Optional station identifier for routing

    Returns:
        MCPServerStreamableHttp: Configured MCP server instance
    """
    global _vista_mcp_instance

    requires_new_client = (
        jwt_token is not None
        or user_duz is not None
        or station is not None
        or _vista_mcp_instance is None
    )

    if requires_new_client:
        try:
            logger.info(
                "Initializing Vista MCP client with URL: %s",
                settings.vista_mcp_server_url,
            )

            params: MCPServerStreamableHttpParams = {
                "url": settings.vista_mcp_server_url,
            }

            # Add JWT token and DUZ if provided
            headers: dict[str, str] = {}
            if jwt_token:
                headers["Authorization"] = f"Bearer {jwt_token}"
                logger.info("Using JWT authentication for MCP client")
            if user_duz:
                headers["X-Vista-DUZ"] = user_duz
                logger.info(f"Using DUZ {user_duz} for MCP client")
            if station:
                headers["X-Vista-Station"] = station
                logger.info(f"Using station {station} for MCP client")

            if headers:
                safe_headers: dict[str, str] = {}
                for key, value in headers.items():
                    if key.lower() == "authorization":
                        safe_headers[key] = value.split(" ")[0] + " ..."
                    else:
                        safe_headers[key] = value
                logger.info("Vista MCP headers: %s", safe_headers)
                params["headers"] = headers

            if not jwt_token and not user_duz and not station:
                logger.info("No JWT token, DUZ, or station provided for MCP client")

            new_instance = MCPServerStreamableHttp(
                params=params,
                name="vista-mcp",
                cache_tools_list=True,
            )

            # Only cache global instance if no auth headers are required
            if not jwt_token and not user_duz and not station:
                _vista_mcp_instance = new_instance

            logger.info("Vista MCP client initialized successfully (Streamable HTTP)")
            return new_instance

        except ImportError as e:
            logger.error(f"MCP module import error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error initializing MCP server: {e}")
            raise

    if _vista_mcp_instance is None:
        raise RuntimeError("Vista MCP client not initialized")
    return _vista_mcp_instance


# The global MCP client instance is managed by _vista_mcp_instance
# and only initialized on first use.

"""Chat service using OpenAI Agents SDK with Azure OpenAI"""

import asyncio
import contextlib
import json
import logging
import re
from collections.abc import AsyncGenerator

from agents import RunConfig, Runner
from openai.types.responses import ResponseTextDeltaEvent

from ..agents.orchestrator import get_orchestrator_agent
from ..config import settings
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
        self, messages: list[ChatMessage], patient_dfn: str | None = None
    ) -> AsyncGenerator[str]:
        """Generate a streaming response"""
        last_user_message = ""
        for msg in reversed(messages):
            if msg.role == "user":
                last_user_message = msg.content
                break

        # Enhance message with patient context if provided
        if patient_dfn:
            enhanced_message = f"Patient DFN: {patient_dfn}\n{last_user_message}"
        else:
            enhanced_message = last_user_message

        # Agent SDK will log its own activity

        vista_mcp = None
        try:
            # Apply rate limit delay if configured (environment-specific)
            if settings.rate_limit_delay_ms > 0:
                await asyncio.sleep(settings.rate_limit_delay_ms / 1000)

            # Get orchestrator (will initialize MCP if needed)
            orchestrator = get_orchestrator_agent(with_mcp=True)

            # Get MCP client for connection
            vista_mcp = get_vista_mcp_client()
            # Connect MCP server before using it
            await vista_mcp.connect()

            # Configure run settings
            run_config = RunConfig(
                # Enable workflow tracing with a name
                workflow_name="vista_patient_query",
                # Include input/output data in traces (controlled by environment)
                # NOTE: Set to False in production if handling PHI/sensitive data
                trace_include_sensitive_data=settings.trace_include_sensitive_data,
                # Add patient DFN as metadata
                trace_metadata={"patient_dfn": patient_dfn} if patient_dfn else {},
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
            # Check if it's a rate limit or Azure service error
            error_message = str(e)
            if "429" in error_message or "rate limit" in error_message.lower():
                # This is often a token limit issue with Azure OpenAI when
                # using many tools
                logger.warning(
                    "Azure rate/token limit hit - likely due to large number "
                    + "of MCP tools"
                )
                error_message = (
                    "Azure OpenAI limit exceeded. This often happens when "
                    "too many tools "
                    "are registered. The Vista MCP server provides 15+ tools which may "
                    "exceed Azure's token limits. Try a simpler query or "
                    "contact your admin "
                    "to increase Azure OpenAI quotas."
                )
            elif (
                "Azure support request" in error_message
                or "An error occurred while processing your request" in error_message
            ):
                # Extract request ID if available

                request_id_match = re.search(r"request ID ([a-f0-9-]+)", error_message)
                request_id = (
                    request_id_match.group(1) if request_id_match else "unknown"
                )

                logger.error(f"Azure service error - Request ID: {request_id}")
                error_message = (
                    "Azure OpenAI service error. This often occurs when the "
                    "model is overloaded "
                    "with too many tools or complex requests. Try disabling "
                    "Vista MCP tools or "
                    "use a simpler query. If the issue persists, contact support with "
                    f"Request ID: {request_id}"
                )
            else:
                # For all other errors, do not expose internal details to the client
                error_message = (
                    "An internal server error occurred. Please try again later."
                )

            # Format error for Vercel AI SDK - it expects the error as a direct string
            yield f"3:{json.dumps(error_message)}\n"
        finally:
            # Cleanup MCP connection
            if vista_mcp is not None:
                with contextlib.suppress(Exception):
                    await vista_mcp.cleanup()

"""Chat service using OpenAI Agents SDK with Azure OpenAI"""

import asyncio
import contextlib
import json
import logging
import re
from collections.abc import AsyncGenerator

from agents import RunConfig, Runner
from fastapi import Request
from openai.types.responses import ResponseTextDeltaEvent

from ..agents.orchestrator import get_orchestrator_agent
from ..config import settings
from ..models.chat import ChatMessage, PatientContext
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
        self,
        messages: list[ChatMessage],
        patient: PatientContext | None = None,
        patient_dfn: str | None = None,  # Backward compatibility
        request: Request | None = None,
    ) -> AsyncGenerator[str]:
        """Generate a streaming response"""
        last_user_message = ""
        for msg in reversed(messages):
            if msg.role == "user":
                last_user_message = msg.content
                break

        # Extract patient context
        patient_icn = None
        patient_dfn = None
        patient_sta3n = None
        if patient:
            patient_icn = patient.icn
            patient_dfn = patient.dfn
            patient_sta3n = patient.sta3n
        elif patient_dfn:
            # Legacy support - use patient_dfn parameter
            patient_icn = patient_dfn  # Treat as ICN for now
            patient_dfn = patient_dfn

        # Enhance message with patient context if provided
        if patient:
            enhanced_message = (
                f"Patient Context:\n"
                f"ICN: {patient.icn}\n"
                f"DFN: {patient.dfn or 'N/A'}\n"
                f"Station: {patient.sta3n or 'Unknown'}\n"
                f"Name: {patient.firstName} {patient.lastName}\n\n"
                f"{last_user_message}"
            )
        elif patient_icn:
            enhanced_message = f"Patient ICN: {patient_icn}\n{last_user_message}"
        else:
            enhanced_message = last_user_message

        # Agent SDK will log its own activity

        vista_mcp = None
        jwt_token = None
        user_duz = None

        # Extract JWT token and DUZ if request provided
        if request and settings.sso_auth_url:
            try:
                from ..services.jwt_auth import jwt_auth_service

                jwt_token_obj = await jwt_auth_service.get_jwt_from_request(request)
                if jwt_token_obj:
                    jwt_token = jwt_token_obj.access_token
                    logger.info(
                        f"Using JWT auth for user: {jwt_token_obj.user_info.email}"
                    )

                    # Extract DUZ based on patient's station
                    if patient_sta3n and jwt_token_obj.user_info.vista_ids:
                        for vista_id in jwt_token_obj.user_info.vista_ids:
                            if vista_id.site_id == patient_sta3n:
                                user_duz = vista_id.duz
                                logger.info(
                                    f"Found DUZ {user_duz} for station {patient_sta3n}"
                                )
                                break

                        if not user_duz:
                            logger.warning(
                                f"No DUZ found for station {patient_sta3n} "
                                f"in user's Vista IDs"
                            )
            except ImportError as e:
                logger.warning(f"JWT auth module import failed: {e}")
            except Exception as e:
                logger.warning(f"JWT auth failed, continuing without: {e}")

        try:
            # Apply rate limit delay if configured (environment-specific)
            if settings.rate_limit_delay_ms > 0:
                await asyncio.sleep(settings.rate_limit_delay_ms / 1000)

            # Get orchestrator with JWT and patient context if available
            orchestrator = get_orchestrator_agent(
                with_mcp=True,
                jwt_token=jwt_token,
                patient_context={
                    "icn": patient_icn,
                    "dfn": patient_dfn,
                    "sta3n": patient_sta3n,
                    "duz": user_duz,
                }
                if patient_icn
                else None,
            )

            # Get MCP client for connection with JWT and DUZ context
            vista_mcp = get_vista_mcp_client(jwt_token, user_duz=user_duz)
            # Connect MCP server before using it
            await vista_mcp.connect()

            # Configure run settings
            run_config = RunConfig(
                # Enable workflow tracing with a name
                workflow_name="vista_patient_query",
                # Include input/output data in traces (controlled by environment)
                # NOTE: Set to False in production if handling PHI/sensitive data
                trace_include_sensitive_data=settings.trace_include_sensitive_data,
                # Add patient context as metadata
                trace_metadata={
                    "patient_icn": patient_icn,
                    "patient_dfn": patient_dfn,
                    "patient_sta3n": patient_sta3n,
                    "user_duz": user_duz,
                }
                if patient_icn
                else {},
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

"""Chat service using OpenAI Agents SDK with Azure OpenAI"""

import json
import logging
from collections.abc import AsyncGenerator

from agents import Agent, Runner, set_default_openai_client, set_tracing_disabled
from openai import AsyncAzureOpenAI
from openai.types.responses import ResponseTextDeltaEvent

from ..config import settings
from ..models.chat import ChatMessage

# Disable OpenAI telemetry/tracing
set_tracing_disabled(True)

logger = logging.getLogger(__name__)


class ChatService:
    """Service for handling chat interactions using OpenAI Agents SDK"""

    agent: Agent

    def __init__(self):
        """Initialize chat service with Azure OpenAI client and agent"""
        # Create Azure OpenAI client with proper retry configuration
        openai_client = AsyncAzureOpenAI(
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            azure_endpoint=settings.azure_openai_endpoint,
            max_retries=5,  # Default is 2, increased for better resilience
            timeout=30.0,  # 30 seconds timeout per request
        )

        # Set as default client for Agents SDK
        set_default_openai_client(openai_client)

        # Create a simple assistant agent
        self.agent = Agent(
            name="Assistant",
            model=settings.azure_openai_deployment_name,
            instructions=(
                "You are a helpful assistant. "
                "Provide clear, concise, and accurate responses."
            ),
            # No tools to prevent multiple API calls
            tools=[],
        )

    async def generate_stream(self, messages: list[ChatMessage]) -> AsyncGenerator[str]:
        """Generate a streaming response"""
        last_user_message = ""
        for msg in reversed(messages):
            if msg.role == "user":
                last_user_message = msg.content
                break

        logger.info(f"Processing message: {last_user_message[:50]}...")
        logger.info(f"Total messages in history: {len(messages)}")

        try:
            # Run with max_turns=1 to prevent multiple API calls
            # The OpenAI SDK will handle retries automatically
            result = Runner.run_streamed(
                self.agent,
                input=last_user_message,
                max_turns=1,  # Only one API call per request
            )

            async for event in result.stream_events():
                if event.type == "raw_response_event" and isinstance(
                    event.data, ResponseTextDeltaEvent
                ):
                    # Properly escape the content for JSON
                    content = json.dumps(event.data.delta)
                    yield f"0:{content}\n"

        except Exception as e:
            logger.error(f"Stream error: {e!s}")
            # Check if it's a rate limit or Azure service error
            error_message = str(e)
            if "Azure support request" in error_message or "429" in error_message:
                error_message = (
                    "The AI service is temporarily unavailable. "
                    "Please try again in a moment."
                )

            # Format error for Vercel AI SDK - it expects the error as a direct string
            yield f"3:{json.dumps(error_message)}\n"

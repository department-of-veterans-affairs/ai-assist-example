"""Chat router for AI conversations"""

import json
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from ..dependencies import Context
from ..models.chat import ChatRequest
from ..services.chat import ChatService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/chat")
async def chat(chat_request: ChatRequest, ctx: Context):
    """
    Streaming chat endpoint

    Args:
        chat_request: Chat request containing messages
        ctx: Request context with user authentication

    Returns:
        Server-sent events stream
    """
    try:
        # Add patient to context
        ctx.patient = chat_request.patient

        chat_service = ChatService()

        # Create a safe streaming wrapper to prevent stack trace exposure
        async def safe_stream_generator():
            try:
                async for chunk in chat_service.generate_stream(
                    messages=chat_request.messages,
                    context=ctx,
                    patient_dfn=chat_request.patient_dfn,  # Keep for backward compatibility
                ):
                    yield chunk
            except Exception as e:
                # Log the full error with stack trace for debugging
                logger.error(f"Streaming error: {e!s}", exc_info=True)
                # Return sanitized error message to user
                error_message = "An internal server error occurred. Please try again later."
                yield f"3:{json.dumps(error_message)}\n"

        return StreamingResponse(
            content=safe_stream_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    except Exception as e:
        # Log the full error with stack trace for debugging
        logger.error(f"Chat error: {e!s}", exc_info=True)
        # Return sanitized error message to user
        raise HTTPException(
            status_code=500,
            detail="An internal server error occurred. Please try again later.",
        ) from None

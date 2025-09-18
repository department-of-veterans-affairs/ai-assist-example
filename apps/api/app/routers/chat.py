"""Chat router for AI conversations"""

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

        return StreamingResponse(
            content=chat_service.generate_stream(
                messages=chat_request.messages,
                context=ctx,
                patient_dfn=chat_request.patient_dfn,  # Keep for backward compatibility
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    except Exception as e:
        logger.error(f"Chat error: {e!s}")
        raise HTTPException(
            status_code=500,
            detail="An internal server error occurred. Please try again later.",
        ) from e

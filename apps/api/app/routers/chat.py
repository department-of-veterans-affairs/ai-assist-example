"""Chat router for AI conversations"""

import logging

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from ..models.chat import ChatRequest
from ..services.chat import ChatService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/chat")
async def chat(chat_request: ChatRequest, request: Request):
    """
    Streaming chat endpoint

    Args:
        chat_request: Chat request containing messages
        request: FastAPI request for cookie extraction

    Returns:
        Server-sent events stream
    """
    try:
        chat_service = ChatService()

        return StreamingResponse(
            content=chat_service.generate_stream(
                messages=chat_request.messages,
                patient_dfn=chat_request.patient_dfn,
                request=request,
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

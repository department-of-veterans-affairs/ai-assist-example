"""Chat-related Pydantic models"""

from pydantic import BaseModel


class ChatMessage(BaseModel):
    """Individual chat message"""

    role: str
    content: str


class ChatRequest(BaseModel):
    """Chat request payload"""

    messages: list[ChatMessage]

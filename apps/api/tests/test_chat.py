"""Tests for chat endpoints"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_chat_endpoint():
    """Test the chat endpoint with a simple message"""
    async with AsyncClient(base_url="http://test") as client:
        response = await client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "Hello, how are you?"}]},
        )

        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream; charset=utf-8"
        assert "x-vercel-ai-data-stream" in response.headers

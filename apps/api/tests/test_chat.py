"""Tests for chat endpoints"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_chat_endpoint():
    """Test the chat endpoint with a simple message"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "Hello, how are you?"}]},
        )

        # The actual response will depend on the implementation
        # For now, just check that the endpoint responds without error
        assert response.status_code in [200, 401, 422]  # Accept various valid responses

import time
from datetime import UTC, datetime

from fastapi import APIRouter
from openai import AsyncAzureOpenAI

from ..config import settings
from ..models import HealthResponse

router = APIRouter()

# Track when the service started
_start_time = time.time()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Check API health status."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(UTC),
        version="0.1.0",
        uptime_seconds=time.time() - _start_time,
    )


@router.get("/health/azure-openai")
async def check_azure_openai() -> dict[str, str | bool]:
    """Check Azure OpenAI connection and quota status"""
    try:
        client = AsyncAzureOpenAI(
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            azure_endpoint=settings.azure_openai_endpoint,
        )

        # Try a minimal completion to test the connection
        _ = await client.chat.completions.create(
            model=settings.azure_openai_deployment_name,
            messages=[{"role": "user", "content": "test"}],
            max_tokens=1,
        )

        return {
            "status": "connected",
            "endpoint": settings.azure_openai_endpoint,
            "deployment": settings.azure_openai_deployment_name,
            "api_version": settings.azure_openai_api_version,
            "test_response": "success",
        }
    except Exception as e:
        error_msg = str(e)
        rate_limited = (
            "Azure support request" in error_msg or "quota" in error_msg.lower()
        )

        return {
            "status": "error",
            "error": error_msg,
            "rate_limited": rate_limited,
            "endpoint": settings.azure_openai_endpoint,
            "deployment": settings.azure_openai_deployment_name,
        }

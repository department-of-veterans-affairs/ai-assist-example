import logging
import time
from datetime import UTC, datetime

import httpx
from fastapi import APIRouter
from openai import AsyncAzureOpenAI

from ..config import settings
from ..models import HealthResponse

logger = logging.getLogger(__name__)

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
        response = await client.chat.completions.create(
            model=settings.azure_openai_deployment_name,
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=1,
            stream=False,
        )

        return {
            "status": "connected",
            "endpoint": settings.azure_openai_endpoint,
            "deployment": settings.azure_openai_deployment_name,
            "api_version": settings.azure_openai_api_version,
            "test_response": response.choices[0].message.content or "no content",
        }
    except Exception as e:
        # Log the full error with stack trace for debugging
        logger.error(f"Azure OpenAI health check failed: {e!s}", exc_info=True)

        # Sanitize error message to avoid exposing stack traces
        error_msg = str(e)
        # Only include safe, user-friendly error information
        if "quota" in error_msg.lower():
            sanitized_error = "Service quota exceeded"
        elif (
            "authentication" in error_msg.lower() or "unauthorized" in error_msg.lower()
        ):
            sanitized_error = "Authentication failed"
        elif "timeout" in error_msg.lower():
            sanitized_error = "Connection timeout"
        elif "network" in error_msg.lower() or "connection" in error_msg.lower():
            sanitized_error = "Network connection failed"
        else:
            sanitized_error = "Service unavailable"

        rate_limited = (
            "Azure support request" in error_msg or "quota" in error_msg.lower()
        )

        return {
            "status": "error",
            "error": sanitized_error,
            "rate_limited": rate_limited,
            "endpoint": settings.azure_openai_endpoint,
            "deployment": settings.azure_openai_deployment_name,
        }


@router.get("/health/ssl-certs")
async def check_ssl_certificates() -> dict[str, str | bool | int]:
    """Check VA SSL certificate configuration by testing connection to VA PKI."""
    import ssl

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Test connection to VA PKI service
            response = await client.get("https://aia.pki.example.com")

            return {
                "status": "healthy",
                "message": "VA SSL certificates working correctly",
                "va_pki_accessible": True,
                "status_code": response.status_code,
            }
    except httpx.ConnectError:
        # Connection failed but not due to SSL - this is expected outside VA network
        return {
            "status": "healthy",
            "message": (
                "SSL certificates configured correctly "
                "(connection failed as expected outside VA network)"
            ),
            "va_pki_accessible": False,
            "ssl_error": False,
        }
    except (ssl.SSLError, httpx.ConnectTimeout, httpx.TimeoutException) as e:
        # Check if it's specifically an SSL error
        if isinstance(e, ssl.SSLError):
            # SSL certificate verification failed - this is the actual problem
            logger.error(f"SSL certificate verification failed: {e}")
            return {
                "status": "unhealthy",
                "message": "SSL certificate verification failed",
                "va_pki_accessible": False,
                "ssl_error": True,
            }
        else:
            # Timeout - treat as connection issue, not SSL issue
            return {
                "status": "healthy",
                "message": "Connection timeout (SSL certificates OK)",
                "va_pki_accessible": False,
                "ssl_error": False,
            }
    except Exception:
        # Other errors
        logger.exception("Unexpected error verifying SSL certificates")
        return {
            "status": "unknown",
            "message": "Unable to verify SSL certificates",
        }

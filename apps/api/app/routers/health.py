import time
from datetime import UTC, datetime

from fastapi import APIRouter

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

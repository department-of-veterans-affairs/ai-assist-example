import time
from datetime import UTC, datetime
from typing import ClassVar

from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter()

# Track when the service started
_start_time = time.time()


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    timestamp: datetime
    version: str
    uptime_seconds: float

    class Config:
        json_schema_extra: ClassVar[dict[str, dict[str, str | float]]] = {
            "example": {
                "status": "healthy",
                "timestamp": "2024-12-23T10:30:00Z",
                "version": "0.1.0",
                "uptime_seconds": 3600.5,
            }
        }


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Check the health status of the API service",
    response_description="Current health status of the service",
    responses={
        200: {
            "description": "Service is healthy",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "timestamp": "2024-12-23T10:30:00Z",
                        "version": "0.1.0",
                        "uptime_seconds": 3600.5,
                    }
                }
            },
        }
    },
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    This endpoint provides information about the current health status of the API,
    including the current timestamp, version, and uptime.

    Returns:
        HealthResponse: Current health status and service information
    """
    current_time = time.time()
    uptime = current_time - _start_time

    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(UTC),
        version="0.1.0",
        uptime_seconds=uptime,
    )

"""Health check models."""

from datetime import datetime

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    timestamp: datetime
    version: str
    uptime_seconds: float

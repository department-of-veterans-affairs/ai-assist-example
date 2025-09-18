"""Authentication dependencies for FastAPI."""

import logging
from typing import Annotated

from fastapi import Depends, Request

from ..config import settings
from ..models.auth import JWTToken
from ..services.jwt_auth import jwt_auth_service

logger = logging.getLogger(__name__)


async def get_current_user(request: Request) -> JWTToken | None:
    """
    Get current user from JWT token if authenticated.

    Returns:
        JWTToken if valid token exists, None otherwise (including dev mode)
    """
    if settings.is_dev_mode:
        from datetime import UTC, datetime, timedelta

        from ..models.auth import UserInfo, VistaId

        # In dev mode, return a test user for testing purposes
        test_user = UserInfo(
            sub="test-user-123",
            email="test.user@example.com",
            first_name="Test",
            last_name="User",
            roles=["staff", "va", "hcp"],
            vista_ids=[
                VistaId(site_id="530", site_name="Test Site #530", duz="123456789"),
                VistaId(
                    site_id="500", site_name="Test VEText VistA", duz="10000000219"
                ),
            ],
        )
        return JWTToken(
            access_token="test-token",
            expires_at=datetime.now(UTC) + timedelta(hours=1),
            user_info=test_user,
        )

    if not settings.sso_auth_url:
        logger.debug(f"SSO_AUTH_URL not configured in {settings.environment}")
        return None

    try:
        jwt_token = await jwt_auth_service.get_jwt_from_request(request)
        if jwt_token and not jwt_token.is_expired:
            return jwt_token
        return None
    except Exception as e:
        logger.debug(f"JWT extraction failed: {e}")
        return None


# Single type alias for dependency injection
CurrentUser = Annotated[JWTToken | None, Depends(get_current_user)]

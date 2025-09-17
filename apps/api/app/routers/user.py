"""User router for current user information."""

import logging

from fastapi import APIRouter, Request

from ..config import settings
from ..models.auth import UserInfo, VistaId
from ..models.user import CurrentUserResponse
from ..services.jwt_auth import jwt_auth_service

logger = logging.getLogger(__name__)

router = APIRouter()


def _get_test_user() -> UserInfo:
    """Get a test user for local development."""
    return UserInfo(
        sub="test-user-123",
        email="test.user@example.com",
        first_name="Test",
        last_name="User",
        roles=["staff", "va", "hcp"],
        vista_ids=[
            VistaId(site_id="530", site_name="Test Site #530", duz="123456789"),
            VistaId(site_id="500", site_name="Test VEText VistA", duz="10000000219"),
        ],
    )


@router.get("/me", response_model=CurrentUserResponse)
async def get_current_user(request: Request):
    """
    Get current user information from JWT token.

    Behavior:
    - Local development: Returns test user
    - Any deployment (dev/stage/prod): Requires valid JWT authentication
    """
    # Check if we're in development mode
    if settings.is_dev_mode:
        logger.debug("Development mode, returning test user")
        return CurrentUserResponse(authenticated=True, user_info=_get_test_user())

    # Deployed environment - always require valid JWT
    try:
        # Check if SSO is properly configured
        if not settings.sso_auth_url:
            logger.error("SSO_AUTH_URL not configured in production environment")
            return CurrentUserResponse(authenticated=False)

        # Try to get JWT from IAMSESSION cookie
        jwt_token = await jwt_auth_service.get_jwt_from_request(request)

        # Check if we got a valid, non-expired JWT
        if jwt_token and not jwt_token.is_expired:
            logger.info(f"User authenticated successfully: {jwt_token.user_info.email}")
            return CurrentUserResponse(
                authenticated=True, user_info=jwt_token.user_info
            )

        # JWT exchange failed or token is expired/invalid
        iamsession = request.cookies.get("IAMSESSION")
        if not iamsession:
            logger.warning("No IAMSESSION cookie found in request")
        elif jwt_token and jwt_token.is_expired:
            logger.warning(f"JWT token expired for user {jwt_token.user_info.email}")
        else:
            logger.warning("Failed to exchange IAMSESSION cookie for valid JWT")

        return CurrentUserResponse(authenticated=False)

    except Exception as e:
        # Log the error with appropriate level based on environment
        if settings.is_production:
            logger.error(f"Authentication error in production: {e}")
        else:
            logger.warning(f"Authentication error in development: {e}")

        # Never return test user when SSO is configured or in production
        return CurrentUserResponse(authenticated=False)

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
    """Get current user information from JWT token."""
    if settings.is_dev_mode:
        logger.debug("Development mode, returning test user")
        return CurrentUserResponse(authenticated=True, user_info=_get_test_user())

    try:
        if not settings.sso_auth_url:
            error_msg = "SSO_AUTH_URL not configured"
            logger.error(f"{error_msg} in {settings.environment} environment")
            return CurrentUserResponse(authenticated=False, error=error_msg)

        jwt_token = await jwt_auth_service.get_jwt_from_request(request)

        if jwt_token and not jwt_token.is_expired:
            logger.info(f"User authenticated successfully: {jwt_token.user_info.email}")
            return CurrentUserResponse(
                authenticated=True, user_info=jwt_token.user_info
            )

        iamsession = request.cookies.get("IAMSESSION")
        if not iamsession:
            error_msg = "No IAMSESSION cookie found"
            logger.warning(error_msg)
            return CurrentUserResponse(authenticated=False, error=error_msg)
        elif jwt_token and jwt_token.is_expired:
            error_msg = f"JWT token expired for user {jwt_token.user_info.email}"
            logger.warning(error_msg)
            return CurrentUserResponse(authenticated=False, error="JWT token expired")
        else:
            error_msg = "Failed to exchange IAMSESSION cookie for valid JWT"
            logger.warning(error_msg)
            return CurrentUserResponse(authenticated=False, error=error_msg)

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Authentication error in {settings.environment}: {error_msg}")
        return CurrentUserResponse(
            authenticated=False, error=f"Authentication error: {error_msg}"
        )

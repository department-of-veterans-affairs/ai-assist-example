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

    In development without SSO configured, returns a test user for frontend development.
    """
    try:
        # If SSO is configured, try to get real JWT
        if settings.sso_auth_url:
            jwt_token = await jwt_auth_service.get_jwt_from_request(request)

            if jwt_token and not jwt_token.is_expired:
                logger.info(f"User info requested for: {jwt_token.user_info.email}")
                return CurrentUserResponse(
                    authenticated=True, user_info=jwt_token.user_info
                )
            else:
                logger.debug("User info requested but no valid JWT token found")
                return CurrentUserResponse(authenticated=False)

        # Development mode: return test user when SSO not configured
        else:
            logger.debug("SSO not configured, returning test user for development")
            return CurrentUserResponse(authenticated=True, user_info=_get_test_user())

    except Exception as e:
        logger.warning(f"Error getting current user: {e}")

        # Fallback to test user in development if SSO not configured
        if not settings.sso_auth_url and settings.is_development:
            logger.debug("Returning test user due to error in development mode")
            return CurrentUserResponse(authenticated=True, user_info=_get_test_user())

        return CurrentUserResponse(authenticated=False)

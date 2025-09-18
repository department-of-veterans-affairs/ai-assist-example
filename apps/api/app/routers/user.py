"""User router for current user information."""

import logging

from fastapi import APIRouter

from ..dependencies import Context
from ..models.user import CurrentUserResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/me", response_model=CurrentUserResponse)
async def get_current_user(ctx: Context):
    """
    Get current user information from JWT token.

    This endpoint attempts to authenticate but returns a response
    regardless of authentication status.
    """
    if ctx.user:
        logger.info(f"User authenticated successfully: {ctx.user.email}")
        return CurrentUserResponse(authenticated=True, user_info=ctx.user)
    else:
        logger.debug("No authenticated user found")
        return CurrentUserResponse(authenticated=False, error="Not authenticated")

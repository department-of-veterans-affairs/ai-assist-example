"""User models for API responses."""

from pydantic import BaseModel, Field

from .auth import UserInfo


class CurrentUserResponse(BaseModel):
    """Response model for current user information."""

    authenticated: bool = Field(..., description="Whether user is authenticated")
    user_info: UserInfo | None = Field(
        default=None, description="User information from JWT"
    )

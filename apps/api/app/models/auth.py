"""Authentication models for JWT and VA STS integration."""

from datetime import UTC, datetime

from pydantic import BaseModel, Field


class VistaId(BaseModel):
    """Vista site identification with DUZ."""

    site_id: str = Field(..., description="Vista site ID")
    site_name: str = Field(..., description="Vista site name")
    duz: str = Field(..., description="User's DUZ for this site")


class UserInfo(BaseModel):
    """User information extracted from JWT payload."""

    sub: str = Field(..., description="User subject ID")
    email: str = Field(..., description="User email address")
    first_name: str = Field(..., description="User first name")
    last_name: str = Field(..., description="User last name")
    roles: list[str] = Field(default_factory=list, description="User roles")
    vista_ids: list[VistaId] = Field(
        default_factory=list, description="Vista site access"
    )


class JWTToken(BaseModel):
    """JWT token with metadata and user information."""

    access_token: str = Field(..., description="The JWT access token")
    expires_at: datetime = Field(..., description="Token expiration time")
    user_info: UserInfo = Field(..., description="User information from token")

    @property
    def is_expired(self) -> bool:
        """Check if the token is expired."""
        return datetime.now(UTC) >= self.expires_at

    def is_near_expiry(self, threshold_minutes: int = 1) -> bool:
        """Check if token expires within threshold minutes."""
        from datetime import timedelta

        threshold = datetime.now(UTC) + timedelta(minutes=threshold_minutes)
        return self.expires_at <= threshold


class AuthSession(BaseModel):
    """Authentication session with IAMSESSION cookie."""

    iamsession: str = Field(..., description="IAMSESSION cookie value")
    jwt_token: JWTToken | None = Field(None, description="Current JWT token")
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    @property
    def needs_jwt_refresh(self) -> bool:
        """Check if JWT token needs to be refreshed."""
        return self.jwt_token is None or self.jwt_token.is_near_expiry()

"""JWT authentication service with caching and renewal."""

import logging

from fastapi import Request

from ..config import settings
from ..models.auth import AuthSession, JWTToken
from .sso_client import SSOClient

logger = logging.getLogger(__name__)


class JWTAuthService:
    """JWT authentication service with caching."""

    def __init__(self):
        self.sso_client = SSOClient()
        self._cache: dict[str, AuthSession] = {}

    def extract_iamsession(self, request: Request) -> str | None:
        """Extract IAMSESSION cookie from request."""
        return request.cookies.get("IAMSESSION")

    async def get_jwt_token(self, iamsession: str) -> JWTToken | None:
        """Get JWT token, using cache or refreshing as needed."""
        if not settings.sso_auth_url or not iamsession:
            return None

        # Check cache
        session = self._cache.get(iamsession)
        if session and not session.needs_jwt_refresh:
            return session.jwt_token

        # Refresh token
        jwt_token = await self.sso_client.exchange_cookie_for_jwt(iamsession)
        if jwt_token:
            # Update cache
            self._cache[iamsession] = AuthSession(
                iamsession=iamsession, jwt_token=jwt_token
            )
            logger.info(f"JWT refreshed for user {jwt_token.user_info.email}")

        return jwt_token

    async def get_jwt_from_request(self, request: Request) -> JWTToken | None:
        """Extract IAMSESSION from request and get JWT token."""
        iamsession = self.extract_iamsession(request)
        if not iamsession:
            return None

        return await self.get_jwt_token(iamsession)


# Global instance
jwt_auth_service = JWTAuthService()

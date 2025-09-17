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
        """
        Get JWT token, using cache or refreshing as needed.

        Returns:
            JWTToken if successful, None if exchange fails or SSO not configured.
        """
        if not settings.sso_auth_url:
            if settings.is_production:
                logger.error("SSO_AUTH_URL not configured in production")
            return None

        if not iamsession:
            logger.debug("No IAMSESSION cookie provided to get_jwt_token")
            return None

        # Check cache
        session = self._cache.get(iamsession)
        if session and not session.needs_jwt_refresh:
            if session.jwt_token:
                logger.debug(
                    f"Using cached JWT for user {session.jwt_token.user_info.email}"
                )
            return session.jwt_token

        # Log cache miss or refresh need
        if session:
            logger.info("JWT needs refresh for cached session (expiry approaching)")
        else:
            logger.debug("No cached session found, performing new JWT exchange")

        # Refresh or get new token
        jwt_token = await self.sso_client.exchange_cookie_for_jwt(iamsession)
        if jwt_token:
            # Update cache
            self._cache[iamsession] = AuthSession(
                iamsession=iamsession, jwt_token=jwt_token
            )
            email = jwt_token.user_info.email
            logger.info(f"JWT successfully obtained/refreshed for user {email}")
            return jwt_token
        else:
            # Remove invalid session from cache
            if iamsession in self._cache:
                logger.info(
                    "Removing invalid session from cache after failed JWT exchange"
                )
                del self._cache[iamsession]
            return None

    async def get_jwt_from_request(self, request: Request) -> JWTToken | None:
        """Extract IAMSESSION from request and get JWT token."""
        iamsession = self.extract_iamsession(request)
        if not iamsession:
            return None

        return await self.get_jwt_token(iamsession)


# Global instance
jwt_auth_service = JWTAuthService()

"""SSO client for JWT token exchange."""

import base64
import json
import logging
from datetime import UTC, datetime

import httpx

from ..config import settings
from ..models.auth import JWTToken, UserInfo, VistaId

logger = logging.getLogger(__name__)


class SSOClient:
    """Client for SSO JWT token exchange."""

    def __init__(self):
        self.endpoint = settings.sso_auth_url
        self.referrer = settings.sso_auth_referrer

    async def exchange_cookie_for_jwt(self, iamsession: str) -> JWTToken | None:
        """
        Exchange IAMSESSION cookie for JWT token.

        Returns:
            JWTToken if successful, None if exchange fails.
            In production, failures should be treated as authentication errors.
        """
        if not self.endpoint:
            logger.error(
                "SSO_AUTH_URL not configured - cannot exchange IAMSESSION for JWT"
            )
            return None

        if not iamsession:
            logger.warning("Empty IAMSESSION cookie provided")
            return None

        headers = {
            "Cookie": f"IAMSESSION={iamsession}",
        }

        if self.referrer:
            headers["Referrer"] = self.referrer

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
                logger.debug(
                    f"Attempting JWT exchange with SSO endpoint: {self.endpoint}"
                )
                response = await client.get(self.endpoint, headers=headers)

                # Check for specific HTTP status codes
                if response.status_code == 401:
                    logger.warning(
                        "IAMSESSION cookie is invalid or expired (401 Unauthorized)"
                    )
                    return None
                elif response.status_code == 403:
                    logger.warning(
                        "Access forbidden during JWT exchange (403 Forbidden)"
                    )
                    return None
                elif response.status_code >= 500:
                    logger.error(
                        f"SSO server error during JWT exchange: {response.status_code}"
                    )
                    return None

                _ = response.raise_for_status()

                jwt_string = response.text.strip()
                if not jwt_string:
                    logger.error("Received empty JWT string from SSO endpoint")
                    return None

                jwt_token = self._parse_jwt(jwt_string)
                if jwt_token:
                    logger.debug(
                        f"JWT exchange successful for user: {jwt_token.user_info.email}"
                    )
                return jwt_token

        except httpx.TimeoutException:
            logger.error("Timeout during JWT exchange with SSO endpoint")
            return None
        except httpx.HTTPError as e:
            logger.error(f"HTTP error during JWT exchange: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during JWT exchange: {e}", exc_info=True)
            return None

    def _parse_jwt(self, jwt_string: str) -> JWTToken | None:
        """
        Parse JWT and extract user info.

        Validates JWT structure and required fields for production use.
        """
        try:
            # Split JWT and validate structure
            parts = jwt_string.split(".")
            if len(parts) != 3:
                logger.error(
                    f"Invalid JWT structure: expected 3 parts, got {len(parts)}"
                )
                return None

            # Decode payload (header.payload.signature)
            payload = parts[1]
            # Add padding if needed
            padding = 4 - len(payload) % 4
            if padding != 4:
                payload += "=" * padding

            decoded = json.loads(base64.urlsafe_b64decode(payload))

            # Validate and extract expiration
            exp_timestamp = decoded.get("exp")
            if not exp_timestamp:
                logger.error("JWT missing required 'exp' claim")
                return None

            expires_at = datetime.fromtimestamp(exp_timestamp, tz=UTC)

            # Check if token is already expired
            if expires_at <= datetime.now(UTC):
                logger.warning(f"JWT is already expired (exp: {expires_at})")
                return None

            # Validate required fields
            sub = decoded.get("sub")
            email = decoded.get("email")

            if not sub:
                logger.error("JWT missing required 'sub' claim")
                return None

            if not email:
                logger.error("JWT missing required 'email' claim")
                return None

            # Extract user info with validation
            user_info = UserInfo(
                sub=sub,
                email=email,
                first_name=decoded.get("firstName", ""),
                last_name=decoded.get("lastName", ""),
                roles=decoded.get("vamf.auth.roles", []),
                vista_ids=[
                    VistaId(
                        site_id=vista.get("siteId", ""),
                        site_name=vista.get("siteName", ""),
                        duz=vista.get("duz", ""),
                    )
                    for vista in decoded.get("vistaIds", [])
                    if vista.get("siteId")
                    and vista.get("duz")  # Only include valid Vista IDs
                ],
            )

            logger.debug(f"Successfully parsed JWT for user: {email}")
            return JWTToken(
                access_token=jwt_string, expires_at=expires_at, user_info=user_info
            )

        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode JWT payload as JSON: {e}")
            return None
        except ValueError as e:
            logger.error(f"JWT validation error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error parsing JWT: {e}", exc_info=True)
            return None

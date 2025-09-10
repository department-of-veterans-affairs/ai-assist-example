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
        """Exchange IAMSESSION cookie for JWT token."""
        if not self.endpoint:
            logger.error("SSO_AUTH_URL not configured")
            return None

        headers = {
            "Cookie": f"IAMSESSION={iamsession}",
        }

        if self.referrer:
            headers["Referrer"] = self.referrer

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.endpoint, headers=headers)
                response.raise_for_status()

                jwt_string = response.text.strip()
                return self._parse_jwt(jwt_string)

        except httpx.HTTPError as e:
            logger.error(f"HTTP error during JWT exchange: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during JWT exchange: {e}")
            return None

    def _parse_jwt(self, jwt_string: str) -> JWTToken | None:
        """Parse JWT and extract user info."""
        try:
            # Split JWT and decode payload
            parts = jwt_string.split(".")
            if len(parts) != 3:
                raise ValueError("Invalid JWT format")

            payload = parts[1]
            # Add padding if needed
            padding = 4 - len(payload) % 4
            if padding != 4:
                payload += "=" * padding

            decoded = json.loads(base64.urlsafe_b64decode(payload))

            # Extract expiration
            exp_timestamp = decoded.get("exp")
            if not exp_timestamp:
                raise ValueError("No expiration in JWT")

            expires_at = datetime.fromtimestamp(exp_timestamp, tz=UTC)

            # Extract user info
            user_info = UserInfo(
                sub=decoded.get("sub", ""),
                email=decoded.get("email", ""),
                first_name=decoded.get("firstName", ""),
                last_name=decoded.get("lastName", ""),
                roles=decoded.get("vamf.auth.roles", []),
                vista_ids=[
                    VistaId(
                        site_id=vista["siteId"],
                        site_name=vista["siteName"],
                        duz=vista["duz"],
                    )
                    for vista in decoded.get("vistaIds", [])
                ],
            )

            return JWTToken(
                access_token=jwt_string, expires_at=expires_at, user_info=user_info
            )

        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"JWT parsing error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error parsing JWT: {e}")
            return None

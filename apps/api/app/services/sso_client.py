"""SSO client for JWT token exchange."""

import base64
import json
import logging
from datetime import UTC, datetime
from typing import cast

import httpx

from ..config import settings
from ..models.auth import JWTToken, UserInfo, VistaId

logger = logging.getLogger(__name__)


class SSOClient:
    """Client for SSO JWT token exchange."""

    def __init__(self):
        self.endpoint: str = settings.sso_auth_url
        self.referrer: str = settings.sso_auth_referrer

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
            headers["Referer"] = self.referrer

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
                logger.info(
                    f"Attempting JWT exchange with SSO endpoint: {self.endpoint}"
                )
                response = await client.get(self.endpoint, headers=headers)

                # Log response details for debugging
                logger.info(f"SSO response status: {response.status_code}")

                # Log response body for non-200 responses or when there's an error
                if response.status_code != 200:
                    response_text = response.text.strip()
                    truncated_response = (
                        response_text[:500] if response_text else "empty"
                    )
                    logger.error(
                        "SSO JWT exchange failed - Status: %s, Response: %s",
                        response.status_code,
                        truncated_response,
                    )

                    # Try to parse JSON error response
                    try:
                        raw_json: object = cast("object", response.json())
                        if isinstance(raw_json, dict):
                            error_data: dict[str, object] = cast(
                                "dict[str, object]", raw_json
                            )
                            err_val = error_data.get("error")
                            if isinstance(err_val, str):
                                logger.error(f"SSO error message: {err_val}")
                            if "user_info" in error_data:
                                logger.error(
                                    f"SSO user_info: {error_data.get('user_info')}"
                                )
                    except Exception:
                        pass  # Response wasn't JSON

                # Check for specific HTTP status codes
                if response.status_code == 401:
                    logger.error(
                        "IAMSESSION cookie is invalid or expired (401 Unauthorized)"
                    )
                    return None
                elif response.status_code == 403:
                    logger.error("Access forbidden during JWT exchange (403 Forbidden)")
                    return None
                elif response.status_code >= 500:
                    logger.error(
                        f"SSO server error during JWT exchange: {response.status_code}"
                    )
                    return None
                elif response.status_code != 200:
                    logger.error(
                        f"Unexpected status code from SSO: {response.status_code}"
                    )
                    return None

                jwt_string = response.text.strip()
                if not jwt_string:
                    logger.error(
                        "Received empty JWT string from SSO endpoint despite 200 status"
                    )
                    return None

                # Check if response looks like an error even with 200 status
                if jwt_string.startswith("{") and "error" in jwt_string:
                    try:
                        raw_error: object = cast("object", json.loads(jwt_string))
                        if isinstance(raw_error, dict):
                            error_response: dict[str, object] = cast(
                                "dict[str, object]", raw_error
                            )
                            error_text = error_response.get("error")
                            auth_val = error_response.get("authenticated")
                            auth_status: str = (
                                str(auth_val) if auth_val is not None else "unknown"
                            )
                            logger.error(
                                "SSO 200 error - Error: %s, Auth: %s",
                                error_text,
                                auth_status,
                            )
                            if "user_info" in error_response:
                                logger.error(
                                    "Error user_info: %s",
                                    error_response.get("user_info"),
                                )
                        return None
                    except json.JSONDecodeError:
                        pass  # Not JSON, try to parse as JWT

                jwt_token = self._parse_jwt(jwt_string)
                if jwt_token:
                    logger.info(
                        f"JWT exchange successful for user: {jwt_token.user_info.email}"
                    )
                else:
                    logger.error("Failed to parse JWT token despite 200 status")
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

            decoded_bytes = base64.urlsafe_b64decode(payload.encode())
            decoded_obj: object = cast("object", json.loads(decoded_bytes))
            if not isinstance(decoded_obj, dict):
                logger.error("JWT payload is not a JSON object")
                return None
            decoded: dict[str, object] = cast("dict[str, object]", decoded_obj)

            # Validate and extract expiration
            exp_timestamp = decoded.get("exp")
            if not isinstance(exp_timestamp, int | float):
                logger.error("JWT missing required 'exp' claim")
                return None

            expires_at = datetime.fromtimestamp(int(exp_timestamp), tz=UTC)

            # Check if token is already expired
            if expires_at <= datetime.now(UTC):
                logger.warning(f"JWT is already expired (exp: {expires_at})")
                return None

            # Validate required fields
            sub_val = decoded.get("sub")
            email_val = decoded.get("email")

            if not isinstance(sub_val, str) or not sub_val:
                logger.error("JWT missing required 'sub' claim")
                return None

            if not isinstance(email_val, str) or not email_val:
                logger.error("JWT missing required 'email' claim")
                return None

            # Extract user info with validation
            # Normalize optional string fields
            first_name_val = decoded.get("firstName", "")
            last_name_val = decoded.get("lastName", "")
            first_name = first_name_val if isinstance(first_name_val, str) else ""
            last_name = last_name_val if isinstance(last_name_val, str) else ""

            # Normalize roles
            roles_raw = decoded.get("vamf.auth.roles", [])
            roles: list[str] = []
            if isinstance(roles_raw, list):
                roles_list: list[object] = cast("list[object]", roles_raw)
                for role_obj in roles_list:
                    if isinstance(role_obj, str):
                        roles.append(role_obj)

            # Normalize vista IDs
            vista_ids_raw = decoded.get("vistaIds", [])
            vista_ids: list[VistaId] = []
            if isinstance(vista_ids_raw, list):
                vista_items: list[object] = cast("list[object]", vista_ids_raw)
                for element in vista_items:
                    item_t: dict[str, object] | None = (
                        cast("dict[str, object]", element)
                        if isinstance(element, dict)
                        else None
                    )
                    if item_t is not None:
                        site_id_val = item_t.get("siteId")
                        duz_val = item_t.get("duz")
                        if (
                            isinstance(site_id_val, str)
                            and site_id_val
                            and isinstance(duz_val, str)
                            and duz_val
                        ):
                            site_name_val = item_t.get("siteName", "")
                            site_name = (
                                site_name_val if isinstance(site_name_val, str) else ""
                            )
                            vista_ids.append(
                                VistaId(
                                    site_id=site_id_val,
                                    site_name=site_name,
                                    duz=duz_val,
                                )
                            )

            user_info = UserInfo(
                sub=sub_val,
                email=email_val,
                first_name=first_name,
                last_name=last_name,
                roles=roles,
                vista_ids=vista_ids,
            )

            logger.debug(f"Successfully parsed JWT for user: {email_val}")
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

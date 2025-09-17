"""Tests for extracting DUZ from JWT based on patient station."""

import json
from base64 import urlsafe_b64encode
from datetime import UTC, datetime, timedelta
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.models.auth import JWTToken, UserInfo, VistaId
from app.services.jwt_auth import JWTAuthService
from app.services.sso_client import SSOClient


def create_test_jwt(vista_ids: list[dict[str, Any]], email: str = "test@example.com") -> str:
    """Create a test JWT token with specified Vista IDs."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": "1014365005",
        "email": email,
        "firstName": "Test",
        "lastName": "User",
        "vamf.auth.roles": ["staff", "va", "hcp"],
        "vistaIds": vista_ids,
        "exp": int((datetime.now(UTC) + timedelta(hours=1)).timestamp()),
    }
    signature = "test_signature"

    # Encode parts
    header_b64 = urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")

    return f"{header_b64}.{payload_b64}.{signature}"


class TestSSOClient:
    """Test SSO client JWT parsing and Vista ID extraction."""

    def test_parse_jwt_with_multiple_vista_ids(self):
        """Test parsing JWT extracts all Vista IDs with DUZ."""
        client = SSOClient()

        jwt_string = create_test_jwt(
            vista_ids=[
                {"siteId": "530", "siteName": "Site #530", "duz": "520824797"},
                {"siteId": "500", "siteName": "500 VEText VistA", "duz": "520824893"},
            ]
        )

        # Note: _parse_jwt is a private method, but we're testing it directly
        # for unit testing purposes
        token = client._parse_jwt(jwt_string)  # pyright: ignore[reportPrivateUsage]

        assert token is not None
        assert len(token.user_info.vista_ids) == 2
        assert token.user_info.vista_ids[0].site_id == "530"
        assert token.user_info.vista_ids[0].duz == "520824797"
        assert token.user_info.vista_ids[1].site_id == "500"
        assert token.user_info.vista_ids[1].duz == "520824893"

    def test_parse_jwt_without_vista_ids(self):
        """Test parsing JWT handles missing Vista IDs gracefully."""
        client = SSOClient()

        # Create JWT without vistaIds field
        header = {"alg": "HS256", "typ": "JWT"}
        payload = {
            "sub": "1014365005",
            "email": "test@example.com",
            "firstName": "Test",
            "lastName": "User",
            "exp": int((datetime.now(UTC) + timedelta(hours=1)).timestamp()),
        }
        signature = "test_signature"

        header_b64 = urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        payload_b64 = (
            urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
        )
        jwt_string = f"{header_b64}.{payload_b64}.{signature}"

        # Note: _parse_jwt is a private method, but we're testing it directly
        # for unit testing purposes
        token = client._parse_jwt(jwt_string)  # pyright: ignore[reportPrivateUsage]

        assert token is not None
        assert token.user_info.vista_ids == []


class TestDUZExtraction:
    """Test DUZ extraction based on patient station."""

    def test_extract_duz_for_matching_station(self):
        """Test finding correct DUZ for patient's station."""
        user_info = UserInfo(
            sub="1014365005",
            email="test@example.com",
            first_name="Test",
            last_name="User",
            roles=["staff"],
            vista_ids=[
                VistaId(site_id="530", site_name="Site #530", duz="520824797"),
                VistaId(site_id="500", site_name="500 VEText", duz="520824893"),
            ],
        )

        # Find DUZ for station 530
        patient_sta3n = "530"
        user_duz = None
        for vista_id in user_info.vista_ids:
            if vista_id.site_id == patient_sta3n:
                user_duz = vista_id.duz
                break

        assert user_duz == "520824797"

    def test_no_duz_for_mismatched_station(self):
        """Test handling when user doesn't have access to patient's station."""
        user_info = UserInfo(
            sub="1014365005",
            email="test@example.com",
            first_name="Test",
            last_name="User",
            roles=["staff"],
            vista_ids=[
                VistaId(site_id="530", site_name="Site #530", duz="520824797"),
            ],
        )

        # Try to find DUZ for station 600 (not in user's access)
        patient_sta3n = "600"
        user_duz = None
        for vista_id in user_info.vista_ids:
            if vista_id.site_id == patient_sta3n:
                user_duz = vista_id.duz
                break

        assert user_duz is None


@pytest.mark.asyncio
class TestJWTAuthService:
    """Test JWT auth service with caching."""

    async def test_get_jwt_from_request_with_cookie(self):
        """Test extracting and exchanging IAMSESSION for JWT."""
        service = JWTAuthService()

        # Mock request with IAMSESSION cookie
        mock_request = MagicMock()
        mock_request.cookies = {"IAMSESSION": "test_session_cookie"}

        # Mock SSO client exchange
        mock_jwt_token = JWTToken(
            access_token="test_jwt",
            expires_at=datetime.now(UTC) + timedelta(hours=1),
            user_info=UserInfo(
                sub="1014365005",
                email="test@example.com",
                first_name="Test",
                last_name="User",
                roles=["staff"],
                vista_ids=[
                    VistaId(site_id="530", site_name="Site #530", duz="520824797"),
                ],
            ),
        )

        with (
            patch.object(
                service.sso_client,
                "exchange_cookie_for_jwt",
                new_callable=AsyncMock,
                return_value=mock_jwt_token,
            ),
            patch("app.services.jwt_auth.settings.sso_auth_url", "http://test"),
        ):
            token = await service.get_jwt_from_request(mock_request)

            assert token is not None
            assert token.user_info.email == "test@example.com"
            assert len(token.user_info.vista_ids) == 1
            assert token.user_info.vista_ids[0].duz == "520824797"

    async def test_cache_reuses_valid_token(self):
        """Test that valid tokens are reused from cache."""
        service = JWTAuthService()

        iamsession = "test_session"
        mock_jwt_token = JWTToken(
            access_token="test_jwt",
            expires_at=datetime.now(UTC) + timedelta(hours=1),
            user_info=UserInfo(
                sub="1014365005",
                email="test@example.com",
                first_name="Test",
                last_name="User",
                roles=[],
                vista_ids=[],
            ),
        )

        with (
            patch.object(
                service.sso_client,
                "exchange_cookie_for_jwt",
                new_callable=AsyncMock,
                return_value=mock_jwt_token,
            ) as mock_exchange,
            patch("app.services.jwt_auth.settings.sso_auth_url", "http://test"),
        ):
            # First call - should hit SSO
            token1 = await service.get_jwt_token(iamsession)
            assert mock_exchange.call_count == 1

            # Second call - should use cache
            token2 = await service.get_jwt_token(iamsession)
            assert mock_exchange.call_count == 1  # Still 1, not 2

            assert token1 == token2

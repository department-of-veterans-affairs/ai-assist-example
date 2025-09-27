"""Tests for user authentication endpoint."""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.auth import JWTToken, UserInfo, VistaId

client = TestClient(app)


@pytest.fixture
def mock_jwt_token():
    """Create a mock JWT token for testing."""
    return JWTToken(
        access_token="test.jwt.token",
        expires_at=datetime.now(UTC) + timedelta(hours=1),
        user_info=UserInfo(
            sub="test-user-123",
            email="test.user@example.com",
            first_name="Test",
            last_name="User",
            roles=["staff", "va", "hcp"],
            vista_ids=[
                VistaId(site_id="TEST001", site_name="Test Site", duz="TEST001001")
            ],
        ),
    )


@pytest.fixture
def expired_jwt_token():
    """Create an expired JWT token for testing."""
    return JWTToken(
        access_token="expired.jwt.token",
        expires_at=datetime.now(UTC) - timedelta(hours=1),
        user_info=UserInfo(
            sub="expired-user",
            email="expired@example.com",
            first_name="Expired",
            last_name="User",
            roles=["staff"],
            vista_ids=[],
        ),
    )


class TestGetCurrentUser:
    """Test /me endpoint for current user information."""

    @patch("app.dependencies.auth.settings")
    def test_development_without_sso_returns_test_user(self, mock_settings):
        """Test that development mode without SSO returns test user."""
        mock_settings.is_dev_mode = True
        mock_settings.is_production = False

        response = client.get("/api/me")

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True
        assert data["user_info"]["email"] == "test.user@example.com"
        assert data["user_info"]["first_name"] == "Test"
        assert data["user_info"]["last_name"] == "User"

    @patch("app.dependencies.auth.settings")
    def test_development_always_returns_test_user(self, mock_settings):
        """Test that development mode always returns test user (SSO not available)."""
        mock_settings.is_dev_mode = True
        mock_settings.is_production = False

        response = client.get("/api/me", cookies={"IAMSESSION": "any-session"})

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True
        assert data["user_info"]["email"] == "test.user@example.com"

    @patch("app.dependencies.auth.settings")
    @patch("app.dependencies.auth.jwt_auth_service")
    def test_production_with_valid_jwt_returns_user(
        self, mock_jwt_service, mock_settings, mock_jwt_token
    ):
        """Test that production with valid JWT returns user info."""
        mock_settings.is_dev_mode = False
        mock_settings.is_development = False
        mock_settings.is_production = True
        mock_settings.sso_auth_url = "https://sso.example.com/auth"
        mock_jwt_service.get_jwt_from_request = AsyncMock(return_value=mock_jwt_token)

        response = client.get("/api/me", cookies={"IAMSESSION": "valid-session"})

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True
        assert data["user_info"]["email"] == "test.user@example.com"

    @patch("app.dependencies.auth.settings")
    @patch("app.dependencies.auth.jwt_auth_service")
    def test_production_with_expired_jwt_returns_unauthenticated(
        self, mock_jwt_service, mock_settings, expired_jwt_token
    ):
        """Test that production with expired JWT returns unauthenticated."""
        mock_settings.is_dev_mode = False
        mock_settings.is_development = False
        mock_settings.is_production = True
        mock_settings.sso_auth_url = "https://sso.example.com/auth"
        mock_jwt_service.get_jwt_from_request = AsyncMock(
            return_value=expired_jwt_token
        )

        response = client.get("/api/me", cookies={"IAMSESSION": "expired-session"})

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is False
        assert data["user_info"] is None

    @patch("app.dependencies.auth.settings")
    @patch("app.dependencies.auth.jwt_auth_service")
    def test_production_without_iamsession_returns_unauthenticated(
        self, mock_jwt_service, mock_settings
    ):
        """Test that production without IAMSESSION cookie returns unauthenticated."""
        mock_settings.is_dev_mode = False
        mock_settings.is_development = False
        mock_settings.is_production = True
        mock_settings.sso_auth_url = "https://sso.example.com/auth"
        mock_jwt_service.get_jwt_from_request = AsyncMock(return_value=None)

        response = client.get("/api/me")

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is False
        assert data["user_info"] is None

    @patch("app.dependencies.auth.settings")
    def test_production_without_sso_configured_returns_unauthenticated(
        self, mock_settings
    ):
        """Test that production without SSO configured returns unauthenticated."""
        mock_settings.is_dev_mode = False
        mock_settings.is_development = False
        mock_settings.is_production = True
        mock_settings.sso_auth_url = ""

        response = client.get("/api/me")

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is False
        assert data["user_info"] is None

    @patch("app.dependencies.auth.settings")
    @patch("app.dependencies.auth.jwt_auth_service")
    def test_production_with_jwt_exchange_failure_returns_unauthenticated(
        self, mock_jwt_service, mock_settings
    ):
        """Test that production with JWT exchange failure returns unauthenticated."""
        mock_settings.is_dev_mode = False
        mock_settings.is_development = False
        mock_settings.is_production = True
        mock_settings.sso_auth_url = "https://sso.example.com/auth"
        mock_jwt_service.get_jwt_from_request = AsyncMock(return_value=None)

        response = client.get("/api/me", cookies={"IAMSESSION": "invalid-session"})

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is False
        assert data["user_info"] is None

    @patch("app.dependencies.auth.settings")
    @patch("app.dependencies.auth.jwt_auth_service")
    def test_production_with_exception_returns_unauthenticated(
        self, mock_jwt_service, mock_settings
    ):
        """Test that production with exception during auth returns unauthenticated."""
        mock_settings.is_dev_mode = False
        mock_settings.is_development = False
        mock_settings.is_production = True
        mock_settings.sso_auth_url = "https://sso.example.com/auth"
        mock_jwt_service.get_jwt_from_request = AsyncMock(
            side_effect=Exception("SSO service error")
        )

        response = client.get("/api/me", cookies={"IAMSESSION": "error-session"})

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is False
        assert data["user_info"] is None

    @patch("app.dependencies.auth.settings")
    def test_staging_environment_returns_test_user(self, mock_settings):
        """Test that staging environment also returns test user."""
        mock_settings.is_dev_mode = True
        mock_settings.is_production = False
        mock_settings.environment = "staging"

        response = client.get("/api/me")

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True
        assert data["user_info"]["email"] == "test.user@example.com"

"""Test DUZ extraction from user's vista_ids based on patient station."""

from datetime import UTC, datetime, timedelta

from app.dependencies.context import RequestContext
from app.models.auth import JWTToken, UserInfo, VistaId
from app.models.chat import PatientContext


def test_duz_extraction_for_matching_station():
    """Test that DUZ is correctly extracted based on patient station."""
    # Create test user with multiple vista_ids
    user_info = UserInfo(
        sub="test-user",
        email="test@va.gov",
        first_name="Test",
        last_name="User",
        roles=["staff"],
        vista_ids=[
            VistaId(site_id="TEST001", site_name="Test Site 001", duz="TEST001001"),
            VistaId(site_id="TEST002", site_name="Test Site 002", duz="TEST002002"),
        ],
    )

    jwt_token = JWTToken(
        access_token="test-token",
        expires_at=datetime.now(UTC) + timedelta(hours=1),
        user_info=user_info,
    )

    # Create patient context with station TEST002
    patient = PatientContext(
        icn="1000000219V596118",
        station="TEST002",
    )

    # Create request context
    context = RequestContext(jwt=jwt_token, patient=patient)

    # Get Vista context
    vista_context = context.get_vista_context()

    # Should extract DUZ for station TEST002
    assert vista_context.duz == "TEST002002"
    assert vista_context.station == "TEST002"


def test_duz_extraction_for_different_station():
    """Test DUZ extraction when patient is at different station."""
    # Create test user with multiple vista_ids
    user_info = UserInfo(
        sub="test-user",
        email="test@va.gov",
        first_name="Test",
        last_name="User",
        roles=["staff"],
        vista_ids=[
            VistaId(site_id="TEST001", site_name="Test Site 001", duz="TEST001001"),
            VistaId(site_id="TEST002", site_name="Test Site 002", duz="TEST002002"),
        ],
    )

    jwt_token = JWTToken(
        access_token="test-token",
        expires_at=datetime.now(UTC) + timedelta(hours=1),
        user_info=user_info,
    )

    # Create patient context with station TEST001
    patient = PatientContext(
        icn="1000000219V596118",
        station="TEST001",
    )

    # Create request context
    context = RequestContext(jwt=jwt_token, patient=patient)

    # Get Vista context
    vista_context = context.get_vista_context()

    # Should extract DUZ for station TEST001
    assert vista_context.duz == "TEST001001"
    assert vista_context.station == "TEST001"


def test_duz_extraction_no_matching_station():
    """Test DUZ extraction when user has no access to station."""
    # Create test user with limited vista_ids
    user_info = UserInfo(
        sub="test-user",
        email="test@va.gov",
        first_name="Test",
        last_name="User",
        roles=["staff"],
        vista_ids=[
            VistaId(site_id="TEST001", site_name="Test Site 001", duz="TEST001001"),
        ],
    )

    jwt_token = JWTToken(
        access_token="test-token",
        expires_at=datetime.now(UTC) + timedelta(hours=1),
        user_info=user_info,
    )

    # Create patient context with station user doesn't have
    patient = PatientContext(
        icn="1000000219V596118",
        station="TEST999",
    )

    # Create request context
    context = RequestContext(jwt=jwt_token, patient=patient)

    # Get Vista context
    vista_context = context.get_vista_context()

    # Should return None when no matching station
    assert vista_context.duz is None
    assert vista_context.station == "TEST999"

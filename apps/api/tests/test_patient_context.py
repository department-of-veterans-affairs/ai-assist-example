"""Tests for patient context handling with ICN, DFN, and station."""

import pytest

from app.models.chat import ChatRequest, PatientContext


def test_patient_context_with_icn_and_dfn():
    """Test PatientContext model accepts both ICN and DFN."""
    context = PatientContext(
        icn="1000000219V596118",
        dfn="TEST001",
        station="TEST001",
        firstName="TEST USER",
        lastName="TESTPATIENT",
    )

    assert context.icn == "1000000219V596118"
    assert context.dfn == "TEST001"
    assert context.station == "TEST001"


def test_patient_context_icn_required():
    """Test that ICN is required in PatientContext."""
    with pytest.raises(ValueError):
        PatientContext(  # pyright: ignore[reportCallIssue]
            dfn="TEST001",  # Missing ICN
            station="TEST001",
        )


def test_patient_context_dfn_optional():
    """Test that DFN is optional for backward compatibility."""
    context = PatientContext(
        icn="1000000219V596118",
        station="TEST001",
    )

    assert context.icn == "1000000219V596118"
    assert context.dfn is None


def test_chat_request_with_patient_context():
    """Test ChatRequest accepts new PatientContext."""
    request = ChatRequest(
        messages=[],
        patient=PatientContext(
            icn="1000000219V596118",
            dfn="TEST001",
            station="TEST001",
            firstName="TEST USER",
            lastName="TESTPATIENT",
        ),
    )

    assert request.patient is not None
    assert request.patient.icn == "1000000219V596118"
    assert request.patient.dfn == "TEST001"
    assert request.patient.station == "TEST001"


def test_chat_request_backward_compatibility():
    """Test ChatRequest still accepts legacy patient_dfn field."""
    request = ChatRequest(
        messages=[],
        patient_dfn="TEST001",  # Legacy field
    )

    assert request.patient_dfn == "TEST001"
    assert request.patient is None


def test_chat_request_with_both_formats():
    """Test ChatRequest can have both new and legacy formats."""
    request = ChatRequest(
        messages=[],
        patient=PatientContext(
            icn="1000000219V596118",
            station="TEST001",
        ),
        patient_dfn="TEST001",  # Legacy field for backward compatibility
    )

    assert request.patient is not None
    assert request.patient.icn == "1000000219V596118"
    assert request.patient_dfn == "TEST001"

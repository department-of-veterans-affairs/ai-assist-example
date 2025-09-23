"""Chat-related Pydantic models"""

from pydantic import BaseModel


class ChatMessage(BaseModel):
    """Individual chat message"""

    role: str
    content: str


class PatientContext(BaseModel):
    """Patient context for Vista queries"""

    icn: str  # (primary identifier for VA)
    dfn: str | None = None  # DFN - kept for backward compatibility
    station: str | None = None  # Station number
    duz: str | None = None  # User's DUZ for the station
    firstName: str | None = None
    lastName: str | None = None


class ChatRequest(BaseModel):
    """Chat request payload"""

    messages: list[ChatMessage]
    patient: PatientContext | None = None  # Patient context for Vista queries
    # Keep backward compatibility
    patient_dfn: str | None = None  # Deprecated: use patient.dfn instead

"""Summary-related Pydantic models"""

from pydantic import BaseModel

from .chat import PatientContext


class SummaryRequest(BaseModel):
    """Summary request payload"""

    patient: PatientContext | None = None  # Patient context for Vista queries

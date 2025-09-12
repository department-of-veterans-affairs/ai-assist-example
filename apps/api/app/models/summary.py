"""Summary-related Pydantic models"""

from pydantic import BaseModel, Field


class SummaryRequest(BaseModel):
    """Summary request payload"""

    patient_dfn: str | None = Field(
        alias="dfn"
    )  # Optional patient DFN for Vista queries

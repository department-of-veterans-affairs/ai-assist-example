"""Pydantic models for medication summaries"""

from typing import Literal

from pydantic import BaseModel, Field

from .chat import PatientContext


class SummaryOptions(BaseModel):
    """Configuration knobs for summary generation."""

    medication_days_back: int = Field(default=183, ge=1, le=3650)
    medication_include_pending: bool = Field(default=True)
    labs_days_back: int = Field(default=1825, ge=1, le=3650)
    labs_n_most_recent: int = Field(default=3, ge=1, le=10)
    vitals_days_back: int = Field(default=365, ge=1, le=3650)
    vitals_n_most_recent: int = Field(default=3, ge=1, le=10)


class SummariesRequest(BaseModel):
    """Request payload for the summaries endpoint."""

    patient: PatientContext
    options: SummaryOptions = Field(default_factory=SummaryOptions)


class MedicationItem(BaseModel):
    """Normalized medication representation consumed by clinicians."""

    name: str
    dose: str | None = None
    route: str | None = None
    sig: str | None = None
    status: str | None = None
    drug_class: str | None = None
    ordered_date: str | None = None
    last_filled: str | None = None
    fills_allowed: int | None = None
    fills_remaining: int | None = None
    provider_name: str | None = None


class MeasurementValue(BaseModel):
    """Single lab or vital measurement."""

    value: str
    date: str


class MeasurementSeries(BaseModel):
    """Chronological measurements for a single metric."""

    name: str
    values: list[MeasurementValue]
    trend: str


class MedicationGroup(BaseModel):
    """Grouped medications aligned to a treatment indication."""

    group_number: int = Field(ge=1)
    treatment_indication: str
    medications: list[MedicationItem]
    problem_list_match_type: Literal["Exact", "Approximate", "Not on Problem List"]
    reasoning: str
    relevant_labs: list[MeasurementSeries] = Field(default_factory=list)
    relevant_vitals: list[MeasurementSeries] = Field(default_factory=list)


class MedicationGroupingOutput(BaseModel):
    """Intermediate output produced by the grouping agent."""

    groups: list[MedicationGroup]


class MedicationSummary(MedicationGroupingOutput):
    """Final enriched medication summary."""

    pass


class MedicationSummaryResponse(BaseModel):
    """Envelope returned by the API."""

    summary_type: Literal["medication"]
    data: MedicationSummary

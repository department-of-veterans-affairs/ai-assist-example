"""Function tools exposed to the medication agents."""

from __future__ import annotations

import json
from typing import TYPE_CHECKING, TypeVar, cast

from agents import FunctionTool, RunContextWrapper, function_tool

from ..services import vista_tools

if TYPE_CHECKING:
    from collections.abc import Awaitable, Callable

    from ..services.vista_tools import (
        LabObservation,
        MedicationRecord,
        ProblemRecord,
        VitalObservation,
    )

if TYPE_CHECKING:
    from .context import MedicationRunContext
else:  # pragma: no cover - runtime fallback for type hints
    MedicationRunContext = object


ToolResultT = TypeVar("ToolResultT")


def _as_cache_key(*values: object) -> tuple[object, ...]:
    return tuple(values)


async def _get_or_load[ToolResultT](
    context: MedicationRunContext,
    cache_name: str,
    params: tuple[object, ...],
    loader: Callable[[], Awaitable[ToolResultT]],
) -> ToolResultT:
    cached = context.get_cached_tool(cache_name, params)
    if cached is not None:
        return cast("ToolResultT", cached)

    data = await loader()
    context.set_cached_tool(cache_name, params, data)
    return data


def _as_json(payload_key: str, payload_value: object) -> str:
    return json.dumps({payload_key: payload_value})


@function_tool(
    name_override="fetch_medications",
    description_override="Fetch and cache medications needed for grouping.",
)
async def _fetch_medications_tool(
    ctx: RunContextWrapper[MedicationRunContext],
    include_pending: bool = True,
    days_back: int | None = None,
) -> str:
    context = ctx.context
    resolved_days = days_back or context.get_int_option("medication_days_back", 183)
    cache_key = _as_cache_key(include_pending, resolved_days)

    async def _load() -> list[MedicationRecord]:
        return await vista_tools.fetch_medications(
            context.vista_mcp,
            patient_icn=context.patient_icn,
            station=context.station,
            include_pending=include_pending,
            days_back=resolved_days,
            limit=context.get_int_option("page_size", context.page_size),
            max_pages=context.max_pages,
        )

    medications = await _get_or_load(context, "fetch_medications", cache_key, _load)
    return _as_json("medications", medications)


@function_tool(
    name_override="fetch_problems",
    description_override="Fetch problem list entries for indication matching.",
)
async def _fetch_problems_tool(
    ctx: RunContextWrapper[MedicationRunContext],
    active_only: bool = True,
    days_back: int | None = None,
) -> str:
    context = ctx.context
    resolved_days = days_back or context.get_int_option("problems_days_back", 365)
    cache_key = _as_cache_key(active_only, resolved_days)

    async def _load() -> list[ProblemRecord]:
        return await vista_tools.fetch_problems(
            context.vista_mcp,
            patient_icn=context.patient_icn,
            station=context.station,
            days_back=resolved_days,
            active_only=active_only,
            limit=context.get_int_option("page_size", context.page_size),
            max_pages=context.max_pages,
        )

    problems = await _get_or_load(context, "fetch_problems", cache_key, _load)
    return _as_json("problems", problems)


@function_tool(
    name_override="fetch_labs",
    description_override="Retrieve recent lab results for medication monitoring.",
)
async def _fetch_labs_tool(
    ctx: RunContextWrapper[MedicationRunContext],
    days_back: int | None = None,
    n_most_recent: int | None = None,
) -> str:
    context = ctx.context
    resolved_days = days_back or context.get_int_option("labs_days_back", 1825)
    resolved_count = n_most_recent or context.get_int_option("labs_n_most_recent", 3)
    cache_key = _as_cache_key(resolved_days, resolved_count)

    async def _load() -> dict[str, list[LabObservation]]:
        return await vista_tools.fetch_labs(
            context.vista_mcp,
            patient_icn=context.patient_icn,
            station=context.station,
            days_back=resolved_days,
            n_most_recent=resolved_count,
            limit=context.get_int_option("page_size", context.page_size),
            max_pages=context.max_pages,
        )

    labs = await _get_or_load(context, "fetch_labs", cache_key, _load)
    return _as_json("labs", labs)


@function_tool(
    name_override="fetch_vitals",
    description_override="Retrieve recent vital sign measurements for monitoring.",
)
async def _fetch_vitals_tool(
    ctx: RunContextWrapper[MedicationRunContext],
    days_back: int | None = None,
    n_most_recent: int | None = None,
) -> str:
    context = ctx.context
    resolved_days = days_back or context.get_int_option("vitals_days_back", 365)
    resolved_count = n_most_recent or context.get_int_option("vitals_n_most_recent", 3)
    cache_key = _as_cache_key(resolved_days, resolved_count)

    async def _load() -> dict[str, list[VitalObservation]]:
        return await vista_tools.fetch_vitals(
            context.vista_mcp,
            patient_icn=context.patient_icn,
            station=context.station,
            days_back=resolved_days,
            n_most_recent=resolved_count,
            limit=context.get_int_option("page_size", context.page_size),
            max_pages=context.max_pages,
        )

    vitals = await _get_or_load(context, "fetch_vitals", cache_key, _load)
    return _as_json("vitals", vitals)


def build_medication_tools() -> dict[str, FunctionTool]:
    """Return the collection of tools used by medication agents."""

    return {
        "fetch_medications": _fetch_medications_tool,
        "fetch_problems": _fetch_problems_tool,
        "fetch_labs": _fetch_labs_tool,
        "fetch_vitals": _fetch_vitals_tool,
    }

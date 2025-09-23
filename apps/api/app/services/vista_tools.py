"""Helpers for interacting with the Vista MCP server."""

from __future__ import annotations

import json
import logging
from collections.abc import Iterable, Mapping
from datetime import datetime
from typing import TYPE_CHECKING, TypedDict, cast

if TYPE_CHECKING:
    from agents.mcp import MCPServerStreamableHttp
    from mcp.types import CallToolResult

logger = logging.getLogger(__name__)

JSONScalar = str | int | float | bool | None
JSONValue = JSONScalar | dict[str, "JSONValue"] | list["JSONValue"]
JsonDict = dict[str, JSONValue]


class MedicationRecord(TypedDict, total=False):
    name: str | None
    dose: str | None
    route: str | None
    sig: str | None
    status: str | None
    drug_class: str | None
    ordered_date: str | None
    last_filled: str | None
    fills_allowed: int | None
    fills_remaining: int | None
    provider_name: str | None


class ProblemRecord(TypedDict, total=False):
    uid: str | None
    name: str | None
    icd_code: str | None
    status: str | None
    onset: str | None


class LabObservation(TypedDict, total=False):
    value: str | None
    units: str | None
    date: str | None


class VitalObservation(TypedDict, total=False):
    value: str | None
    date: str | None


__all__ = [
    "LabObservation",
    "MedicationRecord",
    "ProblemRecord",
    "VistaToolError",
    "VitalObservation",
    "call_vista_tool",
    "collect_paginated",
    "fetch_labs",
    "fetch_medications",
    "fetch_problems",
    "fetch_vitals",
]

ISO_FORMATS: tuple[str, ...] = (
    "%Y-%m-%dT%H:%M:%S%z",
    "%Y-%m-%dT%H:%M:%S.%f%z",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d",
)


class VistaToolError(RuntimeError):
    """Raised when the Vista MCP server cannot fulfil a tool request."""


def _ensure_dict(value: object) -> JsonDict:
    if isinstance(value, dict):
        typed_value = cast("dict[object, JSONValue]", value)
        result: JsonDict = {}
        for key, val in typed_value.items():
            result[str(key)] = val
        return result
    return {}


def _ensure_list_of_dicts(value: object) -> list[JsonDict]:
    if not isinstance(value, list):
        return []
    typed_list = cast("list[object]", value)
    result: list[JsonDict] = []
    for element in typed_list:
        if isinstance(element, dict):
            result.append(_ensure_dict(cast("dict[object, JSONValue]", element)))
    return result


async def call_vista_tool(
    vista_mcp: MCPServerStreamableHttp,
    tool_name: str,
    arguments: Mapping[str, JSONValue],
) -> JsonDict:
    """Call a Vista MCP tool and return the JSON payload."""

    logger.debug("Calling Vista MCP tool %s with arguments: %s", tool_name, arguments)
    args_for_call: dict[str, object] = {str(k): v for k, v in arguments.items()}
    result: CallToolResult = await vista_mcp.call_tool(tool_name, args_for_call)

    if result.isError:
        raise VistaToolError(f"Vista MCP tool {tool_name} returned an error")

    raw_payload = _extract_result_text(result)
    if not raw_payload:
        raise VistaToolError(f"Vista MCP tool {tool_name} returned empty content")

    try:
        payload = cast("JsonDict", json.loads(raw_payload))
    except json.JSONDecodeError as exc:
        raise VistaToolError(
            f"Vista MCP tool {tool_name} returned invalid JSON: {raw_payload[:200]}"
        ) from exc

    if not payload.get("success", True):
        error_message = payload.get("error") or "Vista MCP tool reported failure"
        raise VistaToolError(f"{tool_name} failed: {error_message}")

    return payload


def _extract_result_text(result: CallToolResult) -> str:
    """Extract text payload from a CallToolResult."""

    content_attr = getattr(result, "content", None)
    content_items: list[object] = (
        cast("list[object]", content_attr) if isinstance(content_attr, list) else []
    )

    texts: list[str] = []
    for item in content_items:
        text_attr = getattr(item, "text", None)
        if isinstance(text_attr, str) and text_attr.strip():
            texts.append(text_attr.strip())
            continue

        structured = getattr(item, "structured_content", None)
        if isinstance(structured, str) and structured.strip():
            texts.append(structured.strip())
        elif isinstance(structured, Iterable) and not isinstance(
            structured, str | bytes
        ):
            for embedded in cast("Iterable[object]", structured):
                if isinstance(embedded, dict):
                    embedded_info: JsonDict = _ensure_dict(
                        cast("dict[object, JSONValue]", embedded)
                    )
                    embedded_text = embedded_info.get("text")
                    if isinstance(embedded_text, str) and embedded_text.strip():
                        texts.append(embedded_text.strip())

    if texts:
        return "\n".join(texts).strip()

    serialised: JsonDict = result.model_dump()
    content_raw = serialised.get("content")
    if isinstance(content_raw, list):
        for item in cast("list[object]", content_raw):
            if not isinstance(item, dict):
                continue
            item_dict: JsonDict = _ensure_dict(cast("dict[object, JSONValue]", item))
            text = item_dict.get("text")
            if isinstance(text, str) and text.strip():
                texts.append(text.strip())
                continue
            structured = item_dict.get("structured_content")
            if isinstance(structured, str) and structured.strip():
                texts.append(structured.strip())
            elif isinstance(structured, list):
                for embedded in cast("list[object]", structured):
                    if isinstance(embedded, dict):
                        embedded_details: JsonDict = _ensure_dict(
                            cast("dict[object, JSONValue]", embedded)
                        )
                        embedded_text = embedded_details.get("text")
                        if isinstance(embedded_text, str) and embedded_text.strip():
                            texts.append(embedded_text.strip())

    return "\n".join(texts).strip()


async def fetch_medications(
    vista_mcp: MCPServerStreamableHttp,
    *,
    patient_icn: str,
    station: str | None,
    include_pending: bool,
    days_back: int,
    limit: int,
    max_pages: int,
) -> list[MedicationRecord]:
    """Return simplified medication records for the patient."""

    raw_medications = await collect_paginated(
        vista_mcp,
        tool_name="get_patient_medications",
        arguments={
            "patient_icn": patient_icn,
            "station": station,
            "return_all_active_and_pending": include_pending,
            "active_only": False,
            "days_back": days_back,
        },
        item_key="medications",
        limit=limit,
        max_pages=max_pages,
    )

    return _simplify_medications(raw_medications)


async def fetch_problems(
    vista_mcp: MCPServerStreamableHttp,
    *,
    patient_icn: str,
    station: str | None,
    days_back: int,
    active_only: bool,
    limit: int,
    max_pages: int,
) -> list[ProblemRecord]:
    """Return simplified problem list entries."""

    problems = await collect_paginated(
        vista_mcp,
        tool_name="get_patient_problems",
        arguments={
            "patient_icn": patient_icn,
            "station": station,
            "days_back": days_back,
            "active_only": active_only,
        },
        item_key="problems",
        limit=limit,
        max_pages=max_pages,
    )

    simplified: list[ProblemRecord] = []
    for problem in problems:
        simplified.append(
            ProblemRecord(
                uid=_string_or_none(problem.get("uid")),
                name=_string_or_none(
                    _get_value(problem, "problem_text", "problemText")
                ),
                icd_code=_string_or_none(_get_value(problem, "icd_code", "icdCode")),
                status=_string_or_none(
                    _get_value(problem, "status_name", "statusName")
                ),
                onset=_to_iso_date(_get_value(problem, "onset")),
            )
        )

    return simplified


async def fetch_labs(
    vista_mcp: MCPServerStreamableHttp,
    *,
    patient_icn: str,
    station: str | None,
    days_back: int,
    n_most_recent: int,
    limit: int,
    max_pages: int,
) -> dict[str, list[LabObservation]]:
    """Return lab results grouped by test type."""

    labs = await collect_paginated(
        vista_mcp,
        tool_name="get_patient_labs",
        arguments={
            "patient_icn": patient_icn,
            "station": station,
            "days_back": days_back,
            "n_most_recent": n_most_recent,
        },
        item_key="labs",
        limit=limit,
        max_pages=max_pages,
    )

    grouped: dict[str, list[LabObservation]] = {}
    for lab in labs:
        key = (
            _string_or_none(_get_value(lab, "type_name", "typeName"))
            or _string_or_none(_get_value(lab, "display_name", "displayName"))
            or "Unknown"
        )
        grouped.setdefault(key, []).append(
            LabObservation(
                value=_string_or_none(_get_value(lab, "result")),
                units=_string_or_none(_get_value(lab, "units")),
                date=_to_iso_date(_get_value(lab, "observed")),
            )
        )

    for series in grouped.values():
        series.sort(key=_observation_date, reverse=True)
        del series[n_most_recent:]

    return grouped


async def fetch_vitals(
    vista_mcp: MCPServerStreamableHttp,
    *,
    patient_icn: str,
    station: str | None,
    days_back: int,
    n_most_recent: int,
    limit: int,
    max_pages: int,
) -> dict[str, list[VitalObservation]]:
    """Return vital sign readings grouped by type."""

    vitals = await collect_paginated(
        vista_mcp,
        tool_name="get_patient_vitals",
        arguments={
            "patient_icn": patient_icn,
            "station": station,
            "days_back": days_back,
            "n_most_recent": n_most_recent,
        },
        item_key="vital_signs",
        limit=limit,
        max_pages=max_pages,
    )

    grouped: dict[str, list[VitalObservation]] = {}
    for vital in vitals:
        key = (
            _string_or_none(_get_value(vital, "type_name", "typeName"))
            or _string_or_none(_get_value(vital, "display_name", "displayName"))
            or "Unknown"
        )
        grouped.setdefault(key, []).append(
            VitalObservation(
                value=_string_or_none(_get_value(vital, "result")),
                date=_to_iso_date(_get_value(vital, "observed")),
            )
        )

    for series in grouped.values():
        series.sort(key=_observation_date, reverse=True)
        del series[n_most_recent:]

    return grouped


async def collect_paginated(
    vista_mcp: MCPServerStreamableHttp,
    *,
    tool_name: str,
    arguments: Mapping[str, JSONValue],
    item_key: str,
    limit: int,
    max_pages: int,
) -> list[JsonDict]:
    """Fetch records from a paginated Vista MCP tool.

    Exposed so additional agent workflows can reuse the pagination contract while
    supplying their own post-processing logic.
    """
    offset = 0
    items: list[JsonDict] = []

    for page_index in range(max_pages):
        payload = await call_vista_tool(
            vista_mcp,
            tool_name,
            {
                **arguments,
                "offset": offset,
                "limit": limit,
            },
        )

        data = _ensure_dict(payload.get("data"))
        page_items = _ensure_list_of_dicts(data.get(item_key))
        items.extend(page_items)

        metadata = _ensure_dict(payload.get("metadata"))
        pagination = _ensure_dict(metadata.get("pagination"))
        total_available = _to_int(pagination.get("total_available_items"))
        returned = _to_int(pagination.get("returned")) or len(page_items)

        if not page_items:
            logger.debug(
                "Vista MCP tool %s returned no items on page %s", tool_name, page_index
            )
            break

        offset += returned
        if total_available is not None and offset >= total_available:
            break

    return items


def _simplify_medications(medications: list[JsonDict]) -> list[MedicationRecord]:
    active_keys: set[tuple[str, str | None, str | None, str | None]] = set()
    keyed: list[
        tuple[JsonDict, tuple[str, str | None, str | None, str | None], str]
    ] = []

    for med in medications:
        dose_raw = _first_available(med.get("dosages"), "dose")
        route_raw = _first_available(med.get("dosages"), "route_name", "routeName")
        sig = _string_or_none(_get_value(med, "sig"))
        name_value = _string_or_none(med.get("name")) or ""
        dose: str | None = _string_or_none(dose_raw)
        route: str | None = _string_or_none(route_raw)
        key = (
            name_value.strip().upper(),
            dose.strip().upper() if dose else None,
            route.strip().upper() if route else None,
            sig.strip().upper() if sig else None,
        )
        status = (
            _string_or_none(
                _get_value(med, "va_status", "vaStatus", "med_status", "medStatus")
            )
            or ""
        ).upper()
        if status in {"ACTIVE", "PENDING"}:
            active_keys.add(key)
        keyed.append((med, key, status))

    simplified: list[MedicationRecord] = []
    seen: set[tuple[tuple[str, str | None, str | None, str | None], str]] = set()

    for med, key, status in keyed:
        if status not in {"ACTIVE", "PENDING"} and key in active_keys:
            continue
        dedupe_key = (key, status)
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)
        simplified.append(_convert_medication(med))

    return simplified


def _convert_medication(med: JsonDict) -> MedicationRecord:
    primary_order = _first_entry(_get_value(med, "orders")) or {}
    first_dosage = _first_entry(_get_value(med, "dosages")) or {}
    first_product = _first_entry(_get_value(med, "products")) or {}

    return MedicationRecord(
        name=_string_or_none(med.get("name")),
        dose=_string_or_none(_get_value(first_dosage, "dose")),
        route=_string_or_none(_get_value(first_dosage, "route_name", "routeName")),
        sig=_string_or_none(_get_value(med, "sig")),
        status=_string_or_none(
            _get_value(med, "va_status", "vaStatus", "med_status", "medStatus")
        ),
        drug_class=_string_or_none(
            _get_value(first_product, "drug_class_name", "drugClassName")
        ),
        ordered_date=_to_mmddyyyy(_get_value(primary_order, "ordered")),
        last_filled=_to_mmddyyyy(_get_value(med, "last_filled", "lastFilled")),
        fills_allowed=_to_int(
            _get_value(primary_order, "fills_allowed", "fillsAllowed")
        ),
        fills_remaining=_to_int(
            _get_value(primary_order, "fills_remaining", "fillsRemaining")
        ),
        provider_name=_string_or_none(
            _get_value(primary_order, "provider_name", "providerName")
        ),
    )


def _first_entry(value: object) -> JsonDict | None:
    dicts = _ensure_list_of_dicts(value)
    return dicts[0] if dicts else None


def _first_available(collection: object, *fields: str) -> JSONValue:
    entry = _first_entry(collection)
    if entry is None:
        return None
    return _get_value(entry, *fields)


def _get_value(source: object, *keys: str) -> JSONValue:
    source_dict = _ensure_dict(source)
    for key in keys:
        if not key:
            continue
        if key in source_dict:
            return source_dict[key]
    if keys:
        return source_dict.get(keys[0])
    return None


def _string_or_none(value: object) -> str | None:
    if value is None:
        return None
    value_str = str(value).strip()
    return value_str or None


def _to_int(value: object) -> int | None:
    if value is None:
        return None
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str):
        try:
            return int(value)
        except ValueError:
            return None
    return None


def _parse_datetime(value: object) -> datetime | None:
    if value in (None, ""):
        return None

    if isinstance(value, datetime):
        return value

    value_str = str(value).strip()
    if not value_str:
        return None

    normalized = value_str.replace("Z", "+00:00")
    for fmt in ISO_FORMATS:
        try:
            return datetime.strptime(normalized, fmt)
        except ValueError:
            continue
    return None


def _to_mmddyyyy(value: object) -> str | None:
    dt = _parse_datetime(value)
    if dt is None:
        return None
    return dt.strftime("%m/%d/%Y")


def _to_iso_date(value: object) -> str | None:
    dt = _parse_datetime(value)
    if dt is None:
        return None
    return dt.strftime("%Y-%m-%d")


def _observation_date(observation: LabObservation | VitalObservation) -> str:
    date_value = observation.get("date")
    return date_value or ""

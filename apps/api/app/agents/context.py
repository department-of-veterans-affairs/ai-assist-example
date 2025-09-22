"""Run context objects for medication summary agents."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from agents.mcp import MCPServerStreamableHttp

    from ..models.summaries import MedicationGroupingOutput
else:  # pragma: no cover - runtime fallback for type hints
    MedicationGroupingOutput = object


@dataclass
class VistaRunContext:
    """Common state shared across Vista MCP powered agent runs."""

    vista_mcp: MCPServerStreamableHttp
    patient_icn: str
    station: str | None
    user_duz: str | None
    options: dict[str, object] = field(default_factory=dict)
    max_pages: int = 4
    page_size: int = 100
    tool_cache: dict[str, tuple[tuple[object, ...], object]] = field(
        default_factory=dict
    )

    def get_cached_tool(self, name: str, params: tuple[object, ...]) -> object | None:
        entry = self.tool_cache.get(name)
        if entry is None:
            return None
        cached_params, cached_data = entry
        if cached_params != params:
            return None
        return cached_data

    def set_cached_tool(
        self, name: str, params: tuple[object, ...], data: object
    ) -> None:
        self.tool_cache[name] = (params, data)

    def get_int_option(self, key: str, default: int) -> int:
        """Return an integer option value with safe coercion.

        Accepts ints, numeric strings, and floats. Falls back to the provided
        default on invalid or unsupported types.
        """
        value = self.options.get(key)
        if value is None:
            return default
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
                return default
        return default


@dataclass
class MedicationRunContext(VistaRunContext):
    """Shared context passed to tooling and agents during a medication summary run."""

    grouping_output: MedicationGroupingOutput | None = None

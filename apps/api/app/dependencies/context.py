"""Context dependencies for FastAPI."""

import logging
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException

from ..models.auth import JWTToken, UserInfo
from ..models.chat import PatientContext
from .auth import get_current_user

logger = logging.getLogger(__name__)


@dataclass
class VistaContextData:
    """Resolved Vista authentication and routing fields."""

    token: str | None
    station: str | None
    duz: str | None
    icn: str | None


class RequestContext:
    """Combined request context with user and patient information."""

    jwt: JWTToken | None
    patient: PatientContext | None

    def __init__(
        self,
        jwt: JWTToken | None = None,
        patient: PatientContext | None = None,
    ):
        self.jwt = jwt
        self.patient = patient

    @property
    def user(self) -> UserInfo | None:
        """Get user info if authenticated."""
        return self.jwt.user_info if self.jwt else None

    @property
    def jwt_token(self) -> str | None:
        """Get JWT token string if authenticated."""
        return self.jwt.access_token if self.jwt else None

    def get_user_duz_for_station(self, station: str | None) -> str | None:
        """Get user's DUZ for a specific station from JWT vista_ids."""
        if not station or not self.user or not self.user.vista_ids:
            return None

        for vista_id in self.user.vista_ids:
            if vista_id.site_id == station:
                return vista_id.duz
        return None

    def get_mcp_params(self) -> tuple[str | None, str | None, str | None]:
        """Return auth headers and station metadata for Vista MCP."""
        vista_context = self.get_vista_context()
        return vista_context.token, vista_context.duz, vista_context.station

    def get_vista_context(self) -> VistaContextData:
        """Return resolved Vista context without enforcing presence."""
        station = self.patient.station if self.patient else None
        duz = self.get_user_duz_for_station(station)
        icn = self.patient.icn if self.patient else None
        return VistaContextData(
            token=self.jwt_token,
            station=station,
            duz=duz,
            icn=icn,
        )

    def require_vista_context(
        self,
        *,
        logger: logging.Logger,
        require_icn: bool = False,
        endpoint: str,
    ) -> VistaContextData:
        """Ensure station, DUZ (and optionally ICN) are present and log issues."""

        vista_context = self.get_vista_context()

        if require_icn and not vista_context.icn:
            logger.error(
                "%s missing patient ICN",
                endpoint,
            )
            raise HTTPException(
                status_code=400,
                detail="Patient ICN is required to process this request.",
            )

        if not vista_context.station:
            logger.error(
                "%s missing station (icn=%s, duz=%s)",
                endpoint,
                vista_context.icn or "missing",
                vista_context.duz or "missing",
            )
            raise HTTPException(
                status_code=400,
                detail="Patient station is required to call VistA.",
            )

        if not vista_context.duz:
            logger.error(
                "%s missing DUZ (icn=%s, station=%s)",
                endpoint,
                vista_context.icn or "missing",
                vista_context.station,
            )
            raise HTTPException(
                status_code=403,
                detail="User DUZ is required for Vista access.",
            )

        return vista_context


async def get_request_context(
    jwt: Annotated[JWTToken | None, Depends(get_current_user)],
) -> RequestContext:
    """
    Get request context with JWT/user information.
    Patient context is added at the endpoint level.
    """
    return RequestContext(jwt=jwt)


# Type alias for dependency injection
Context = Annotated[RequestContext, Depends(get_request_context)]

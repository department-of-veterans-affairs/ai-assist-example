"""Context dependencies for FastAPI."""

import logging
from typing import Annotated

from fastapi import Depends

from ..models.auth import JWTToken, UserInfo
from ..models.chat import PatientContext
from .auth import get_current_user

logger = logging.getLogger(__name__)


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

    @property
    def user_duz(self) -> str | None:
        """Get user's DUZ for the patient's station."""
        if not self.jwt or not self.patient:
            return None

        if self.patient.station and self.jwt.user_info.vista_ids:
            for vista_id in self.jwt.user_info.vista_ids:
                if vista_id.site_id == self.patient.station:
                    return vista_id.duz
        return None

    def get_mcp_params(self) -> tuple[str | None, str | None]:
        """Get parameters needed for MCP client initialization."""
        return self.jwt_token, self.user_duz


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

"""summaries router."""

from fastapi import APIRouter

from ..dependencies import Context
from ..models.summaries import SummariesRequest
from ..services.summaries import SummariesService

router = APIRouter()
_service = SummariesService()


@router.post("/{summary_type}")
async def create_summary(
    summary_type: SummariesService.SummaryType,
    request: SummariesRequest,
    ctx: Context,
):
    ctx.patient = request.patient
    return await _service.generate_summary(summary_type, request, ctx)

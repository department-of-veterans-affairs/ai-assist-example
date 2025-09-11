"""Router for canned summaries"""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from ..models.summary import SummaryRequest
from ..services.summary import SummaryService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/medications")
async def medications_summary(request: SummaryRequest):
    try:
        if not request.patient_dfn:
            raise HTTPException(
                status_code=400,
                detail="Patient DFN is required for medication summaries.",
            )
        summary_service = SummaryService()

        return Response(
            content=await summary_service.generate_summary(
                SummaryService.SummaryType.MEDICATIONS, patient_dfn=request.patient_dfn
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except Exception as e:
        logger.error(f"Summary error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An internal server error occurred. Please try again later.",
        ) from e

"""Router for canned summaries"""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from ..dependencies import Context
from ..models.summary import SummaryRequest
from ..services.summary import SummaryService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/medications")
async def medications_summary(request: SummaryRequest, ctx: Context):
    try:
        # Add patient to context
        ctx.patient = request.patient

        if not ctx.patient or not ctx.patient.icn:
            raise HTTPException(
                status_code=400,
                detail="Patient ICN is required for medication summaries.",
            )

        summary_service = SummaryService()

        return Response(
            content=await summary_service.generate_summary(
                SummaryService.SummaryType.MEDICATIONS,
                context=ctx,
            ),
            media_type="application/json",
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

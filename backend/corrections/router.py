import uuid
from typing import Optional, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .store import load_corrections, save_correction, now_ts
from ..audit.logger import log_event

router = APIRouter()


class CorrectionRequest(BaseModel):
    faculty_name: str = Field(..., min_length=1)
    date: str = Field(..., description="YYYY-MM-DD")
    period: Optional[str] = None
    reason: str = Field(..., min_length=5)
    requester: Optional[str] = None


class CorrectionReview(BaseModel):
    status: str = Field(..., description="approved | rejected")
    reviewer: Optional[str] = None
    notes: Optional[str] = None


@router.post("/request")
async def create_request(payload: CorrectionRequest):
    data = load_corrections()
    item = {
        "id": uuid.uuid4().hex,
        "faculty_name": payload.faculty_name.strip(),
        "date": payload.date,
        "period": payload.period,
        "reason": payload.reason.strip(),
        "requester": (payload.requester or "unknown").strip(),
        "status": "pending",
        "reviewer": None,
        "notes": None,
        "created_at": now_ts(),
        "updated_at": now_ts(),
    }
    if not save_correction(item):
        raise HTTPException(status_code=500, detail="Failed to save correction request")
    log_event("correction_request", "success", f"{item['faculty_name']} {item['date']} {item['period']}", item["requester"])
    return {"status": "success", "request": item}


@router.get("/list")
async def list_requests(status: Optional[str] = None):
    data = load_corrections(status=status)
    return {"requests": data}


@router.post("/{request_id}/review")
async def review_request(request_id: str, payload: CorrectionReview):
    if payload.status not in {"approved", "rejected"}:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")

    data = load_corrections()
    for item in data:
        if item.get("id") == request_id:
            item["status"] = payload.status
            item["reviewer"] = (payload.reviewer or "reviewer").strip()
            item["notes"] = payload.notes
            item["updated_at"] = now_ts()
            if not save_correction(item):
                raise HTTPException(status_code=500, detail="Failed to update correction request")
            log_event("correction_review", "success", f"{request_id} -> {payload.status}", item["reviewer"])
            return {"status": "success", "request": item}

    raise HTTPException(status_code=404, detail="Correction request not found")

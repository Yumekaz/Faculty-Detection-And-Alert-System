from typing import Optional, List
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

from . import attendance_engine
from . import scheduler
from .. import db
from ..config.config_store import DEFAULT_CONFIG

# Import global models from inference service to pass to engine
from ..inference.router import MODELS, ensure_models_loaded
from ..audit.logger import log_event

router = APIRouter()

# --- Pydantic Models ---
class ManualCheckPayload(BaseModel):
    target_faculty: Optional[str] = None

class ScheduleItem(BaseModel):
    period: int
    start: str
    end: str
    faculty: str
    subject: Optional[str] = None

class ScheduleUpdatePayload(BaseModel):
    schedule: List[ScheduleItem]

# --- Endpoints ---

@router.post("/attendance/manual")
async def manual_attendance_check(payload: ManualCheckPayload):
    """Trigger a single immediate attendance check."""
    ensure_models_loaded(require_insightface=True)
    
    matched, name, confidence = attendance_engine.perform_attendance_check(
        yolo_model=MODELS["yolo"],
        insightface_app=MODELS["insightface"],
        config={'detection_time': 5}, # Fast check for manual trigger
        target_faculty=payload.target_faculty,
        period_info=scheduler.get_current_period(),
        mode="manual"
    )
    
    result = {
        "matched": matched,
        "name": name,
        "confidence": confidence
    }
    log_event("attendance_manual", "success", f"matched={matched} name={name}", payload.target_faculty or "system")
    return result

@router.post("/attendance/auto/start")
async def start_auto_attendance():
    """Start the background automated attendance loop."""
    ensure_models_loaded(require_insightface=True)
    
    success, message = attendance_engine.start_auto_attendance_loop(
        yolo_model=MODELS["yolo"],
        insightface_app=MODELS["insightface"],
        get_current_period_func=scheduler.get_current_period
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
        
    log_event("attendance_auto_start", "success", message, "system")
    return {"status": "success", "message": message}

@router.post("/attendance/auto/stop")
async def stop_auto_attendance():
    """Stop the background automated attendance loop."""
    success, message = attendance_engine.stop_auto_attendance_loop()
    log_event("attendance_auto_stop", "success", message, "system")
    return {"status": "success", "message": message}

@router.get("/attendance/logs")
async def get_logs():
    """Return logs as JSON records."""
    try:
        db.init_db(DEFAULT_CONFIG)
        logs = db.list_attendance_logs()
        return {"logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading logs: {str(e)}")

@router.post("/attendance/logs/clear")
async def clear_logs():
    """Clear the attendance log file."""
    try:
        db.init_db(DEFAULT_CONFIG)
        db.clear_attendance_logs()
        log_event("attendance_logs_clear", "success", "Logs cleared", "system")
        return {"status": "success", "message": "Logs cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing logs: {str(e)}")

# --- Schedule Endpoints ---

@router.get("/schedule/current")
async def get_current_period_endpoint():
    period = scheduler.get_current_period()
    return {"period": period}

@router.get("/schedule/next")
async def get_next_period_endpoint():
    period = scheduler.get_next_period()
    return {"period": period}

@router.get("/schedule/all")
async def get_full_schedule():
    data = scheduler.load_schedule()
    return {"schedule": data}

@router.post("/schedule/update")
async def update_schedule(payload: ScheduleUpdatePayload):
    cleaned = []
    for item in payload.schedule:
        if item.period <= 0:
            raise HTTPException(status_code=400, detail="Period must be a positive number")
        if not item.faculty or not item.faculty.strip():
            raise HTTPException(status_code=400, detail="Faculty name is required")
        if len(item.start) != 5 or len(item.end) != 5:
            raise HTTPException(status_code=400, detail="Start/End must be HH:MM format")
        if item.start >= item.end:
            raise HTTPException(status_code=400, detail="Start time must be before end time")
        cleaned.append(item.dict())

    scheduler.save_schedule(cleaned)
    log_event("schedule_update", "success", f"count={len(cleaned)}", "system")
    return {"status": "success", "message": "Schedule updated"}

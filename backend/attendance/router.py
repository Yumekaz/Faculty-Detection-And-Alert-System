import os
import pandas as pd
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

from . import attendance_engine
from . import scheduler

# Import global models from inference service to pass to engine
from ..inference.router import MODELS, ensure_models_loaded

router = APIRouter()

# --- Pydantic Models ---
class ManualCheckPayload(BaseModel):
    target_faculty: Optional[str] = None

class ScheduleUpdatePayload(BaseModel):
    schedule: List[dict]

# --- Endpoints ---

@router.post("/attendance/manual")
async def manual_attendance_check(payload: ManualCheckPayload):
    """Trigger a single immediate attendance check."""
    ensure_models_loaded()
    
    matched, name, confidence = attendance_engine.perform_attendance_check(
        yolo_model=MODELS["yolo"],
        insightface_app=MODELS["insightface"],
        config={'detection_time': 5}, # Fast check for manual trigger
        target_faculty=payload.target_faculty,
        period_info=scheduler.get_current_period(),
        mode="manual"
    )
    
    return {
        "matched": matched,
        "name": name,
        "confidence": confidence
    }

@router.post("/attendance/auto/start")
async def start_auto_attendance():
    """Start the background automated attendance loop."""
    ensure_models_loaded()
    
    success, message = attendance_engine.start_auto_attendance_loop(
        yolo_model=MODELS["yolo"],
        insightface_app=MODELS["insightface"],
        get_current_period_func=scheduler.get_current_period
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
        
    return {"status": "success", "message": message}

@router.post("/attendance/auto/stop")
async def stop_auto_attendance():
    """Stop the background automated attendance loop."""
    success, message = attendance_engine.stop_auto_attendance_loop()
    return {"status": "success", "message": message}

@router.get("/attendance/logs")
async def get_logs():
    """Return logs as JSON records."""
    if not os.path.exists(attendance_engine.LOG_FILE):
        return {"logs": []}
        
    try:
        df = pd.read_csv(attendance_engine.LOG_FILE)
        # Convert NaN to None for valid JSON
        df = df.where(pd.notnull(df), None)
        return {"logs": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading logs: {str(e)}")

@router.post("/attendance/logs/clear")
async def clear_logs():
    """Clear the attendance log file."""
    try:
        # Re-initialize empty file
        pd.DataFrame(columns=["timestamp", "status", "name", "confidence", "period", "mode"]).to_csv(attendance_engine.LOG_FILE, index=False)
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
    scheduler.save_schedule(payload.schedule)
    return {"status": "success", "message": "Schedule updated"}
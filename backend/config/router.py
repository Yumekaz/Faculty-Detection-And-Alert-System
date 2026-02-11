from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional

from . import config_store
from ..audit.logger import log_event

router = APIRouter()

# --- Pydantic Models ---

class ConfigModel(BaseModel):
    detection_time: int
    threshold: float
    sender_email: str
    sender_password: str
    email_receiver: str
    notification_mode: str

class PartialConfigModel(BaseModel):
    detection_time: Optional[int] = None
    threshold: Optional[float] = None
    sender_email: Optional[str] = None
    sender_password: Optional[str] = None
    email_receiver: Optional[str] = None
    notification_mode: Optional[str] = None

# --- Endpoints ---

@router.get("/config")
async def get_current_config():
    """Returns the current system configuration."""
    return config_store.load_config()

@router.post("/config/update")
async def update_full_config(config: ConfigModel):
    """Overwrites the current configuration with the provided payload."""
    if config.detection_time < 1 or config.detection_time > 60:
        raise HTTPException(status_code=400, detail="detection_time must be 1-60 seconds")
    if config.threshold < 0.1 or config.threshold > 1.0:
        raise HTTPException(status_code=400, detail="threshold must be 0.1-1.0")
    if config.notification_mode not in ["Absent Only", "All (Present & Absent)", "None"]:
        raise HTTPException(status_code=400, detail="Invalid notification_mode")

    # Convert Pydantic model to dict
    config_dict = config.dict()
    
    if config_store.save_config(config_dict):
        log_event("config_update_full", "success", "Config updated", "admin")
        return {"status": "success", "message": "Configuration updated", "config": config_dict}
    else:
        raise HTTPException(status_code=500, detail="Failed to save configuration")

@router.patch("/config/update")
async def update_partial_config(updates: PartialConfigModel):
    """Updates only specific fields in the configuration."""
    current_config = config_store.load_config()
    
    # Update only provided fields (exclude_unset=True)
    update_data = updates.dict(exclude_unset=True)
    if "detection_time" in update_data:
        if update_data["detection_time"] < 1 or update_data["detection_time"] > 60:
            raise HTTPException(status_code=400, detail="detection_time must be 1-60 seconds")
    if "threshold" in update_data:
        if update_data["threshold"] < 0.1 or update_data["threshold"] > 1.0:
            raise HTTPException(status_code=400, detail="threshold must be 0.1-1.0")
    if "notification_mode" in update_data:
        if update_data["notification_mode"] not in ["Absent Only", "All (Present & Absent)", "None"]:
            raise HTTPException(status_code=400, detail="Invalid notification_mode")
    current_config.update(update_data)
    
    if config_store.save_config(current_config):
        log_event("config_update_partial", "success", f"fields={list(update_data.keys())}", "admin")
        return {"status": "success", "message": "Configuration updated partially", "config": current_config}
    else:
        raise HTTPException(status_code=500, detail="Failed to save configuration")

@router.post("/config/reset")
async def reset_config():
    """Resets configuration to system defaults."""
    default_conf = config_store.DEFAULT_CONFIG.copy()
    
    if config_store.save_config(default_conf):
        log_event("config_reset", "success", "Config reset to defaults", "admin")
        return {"status": "success", "message": "Configuration reset to defaults", "config": default_conf}
    else:
        raise HTTPException(status_code=500, detail="Failed to reset configuration")

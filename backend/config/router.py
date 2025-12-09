from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional

from . import config_store

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
    # Convert Pydantic model to dict
    config_dict = config.dict()
    
    if config_store.save_config(config_dict):
        return {"status": "success", "message": "Configuration updated", "config": config_dict}
    else:
        raise HTTPException(status_code=500, detail="Failed to save configuration")

@router.patch("/config/update")
async def update_partial_config(updates: PartialConfigModel):
    """Updates only specific fields in the configuration."""
    current_config = config_store.load_config()
    
    # Update only provided fields (exclude_unset=True)
    update_data = updates.dict(exclude_unset=True)
    current_config.update(update_data)
    
    if config_store.save_config(current_config):
        return {"status": "success", "message": "Configuration updated partially", "config": current_config}
    else:
        raise HTTPException(status_code=500, detail="Failed to save configuration")

@router.post("/config/reset")
async def reset_config():
    """Resets configuration to system defaults."""
    default_conf = config_store.DEFAULT_CONFIG.copy()
    
    if config_store.save_config(default_conf):
        return {"status": "success", "message": "Configuration reset to defaults", "config": default_conf}
    else:
        raise HTTPException(status_code=500, detail="Failed to reset configuration")
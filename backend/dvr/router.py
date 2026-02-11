# DVR API Router
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from typing import Optional

from .config import load_config, save_config, DEFAULT_CONFIG
from .streaming import stream_manager
from ..audit.logger import log_event

router = APIRouter()


# --- Pydantic Models ---
class DVRConfig(BaseModel):
    ip: str
    port: int
    username: str
    password: str
    num_cameras: Optional[int] = 3


class DVRConfigResponse(BaseModel):
    ip: str
    port: int
    username: str
    num_cameras: int
    resolution: dict


# --- Endpoints ---

@router.get("/status")
async def get_status():
    """Get DVR connection status"""
    camera_status = stream_manager.get_status()
    active_count = sum(1 for s in camera_status.values() if s)
    
    return {
        "running": stream_manager.is_running(),
        "cameras": camera_status,
        "active_cameras": active_count,
        "total_cameras": len(camera_status)
    }


@router.get("/config")
async def get_config():
    """Get current DVR configuration (password hidden)"""
    config = load_config()
    return DVRConfigResponse(
        ip=config['ip'],
        port=config['port'],
        username=config['username'],
        num_cameras=config['num_cameras'],
        resolution=config['resolution']
    )


@router.post("/config")
async def update_config(config: DVRConfig):
    """Update DVR configuration"""
    current = load_config()
    
    current['ip'] = config.ip
    current['port'] = config.port
    current['username'] = config.username
    current['password'] = config.password
    if config.num_cameras:
        current['num_cameras'] = config.num_cameras
    
    if not save_config(current):
        raise HTTPException(status_code=500, detail="Failed to save configuration")
    
    # Reload config in stream manager
    stream_manager.reload_config()
    
    log_event("dvr_config_update", "success", f"{config.ip}:{config.port}", "admin")
    return {"status": "success", "message": "Configuration updated"}


@router.post("/connect")
async def connect_cameras():
    """Connect to all configured cameras"""
    results = stream_manager.connect_all()
    active = sum(1 for s in results.values() if s)
    
    log_event("dvr_connect", "success", f"active={active}", "admin")
    return {
        "status": "success",
        "cameras": results,
        "active_cameras": active,
        "total_cameras": len(results)
    }


@router.post("/disconnect")
async def disconnect_cameras():
    """Disconnect all cameras"""
    stream_manager.disconnect_all()
    log_event("dvr_disconnect", "success", "All cameras disconnected", "admin")
    return {"status": "success", "message": "All cameras disconnected"}


@router.get("/stream/{channel}")
async def stream_camera(channel: int):
    """Stream camera feed as MJPEG"""
    config = load_config()
    
    if channel < 1 or channel > config['num_cameras']:
        raise HTTPException(status_code=400, detail=f"Invalid channel. Must be 1-{config['num_cameras']}")
    
    if not stream_manager.is_running():
        raise HTTPException(status_code=400, detail="Streaming not started. Call /connect first.")
    
    return StreamingResponse(
        stream_manager.generate_mjpeg(channel),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.post("/snapshot")
async def capture_snapshot():
    """Capture a snapshot of all cameras"""
    snapshot = stream_manager.capture_snapshot()
    
    if snapshot is None:
        raise HTTPException(status_code=500, detail="Failed to capture snapshot")
    
    log_event("dvr_snapshot", "success", "Snapshot captured", "admin")
    return Response(
        content=snapshot,
        media_type="image/jpeg",
        headers={"Content-Disposition": "attachment; filename=snapshot.jpg"}
    )


@router.post("/reset")
async def reset_config():
    """Reset configuration to defaults"""
    if not save_config(DEFAULT_CONFIG.copy()):
        raise HTTPException(status_code=500, detail="Failed to reset configuration")
    
    stream_manager.reload_config()
    log_event("dvr_config_reset", "success", "DVR config reset", "admin")
    return {"status": "success", "message": "Configuration reset to defaults"}

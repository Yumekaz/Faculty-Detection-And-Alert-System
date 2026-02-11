from fastapi import APIRouter

from ..config import config_store
from ..attendance import scheduler
from ..inference.router import MODELS
from ..recognition import faiss_store
from ..dvr.streaming import stream_manager

router = APIRouter()


@router.get("/health")
async def health():
    config_ok = True
    schedule_ok = True
    faculty_count = 0

    try:
        config_store.load_config()
    except Exception:
        config_ok = False

    try:
        schedule = scheduler.load_schedule()
    except Exception:
        schedule_ok = False
        schedule = []

    try:
        faculty_data, _ = faiss_store.load_faculty_database()
        faculty_count = len(faculty_data.get("names", []))
    except Exception:
        faculty_count = 0

    cameras = stream_manager.get_status()
    active_cameras = sum(1 for s in cameras.values() if s)

    return {
        "status": "ok",
        "models_loaded": MODELS["yolo"] is not None,
        "insightface_loaded": MODELS["insightface"] is not None,
        "config_ok": config_ok,
        "schedule_ok": schedule_ok,
        "schedule_count": len(schedule),
        "faculty_count": faculty_count,
        "dvr_running": stream_manager.is_running(),
        "active_cameras": active_cameras,
        "total_cameras": len(cameras),
    }

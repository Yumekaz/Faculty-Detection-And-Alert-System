import io
import os
import zipfile
import json
import csv
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from ..recognition.faiss_store import IMAGES_DIR, EMBEDDINGS_FILE, FAISS_INDEX_FILE
from .. import db
from ..config.config_store import DEFAULT_CONFIG

router = APIRouter()


@router.get("/attendance-logs")
async def export_attendance_logs():
    db.init_db(DEFAULT_CONFIG)
    rows = db.list_attendance_logs()
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["timestamp", "status", "name", "confidence", "period", "mode"])
    for row in rows:
        writer.writerow([row["timestamp"], row["status"], row["name"], row["confidence"], row["period"], row["mode"]])
    data = buffer.getvalue().encode("utf-8")
    return StreamingResponse(
        io.BytesIO(data),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=attendance_log.csv"}
    )


@router.get("/schedule")
async def export_schedule():
    db.init_db(DEFAULT_CONFIG)
    schedule = db.get_schedule()
    data = json.dumps(schedule, indent=2).encode("utf-8")
    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=schedule.json"}
    )


@router.get("/config")
async def export_config():
    db.init_db(DEFAULT_CONFIG)
    config = db.get_config()
    config.pop("id", None)
    data = json.dumps(config, indent=2).encode("utf-8")
    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=system_config.json"}
    )


@router.get("/backup")
async def export_backup():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        db.init_db(DEFAULT_CONFIG)
        if os.path.exists(db.DB_PATH):
            zipf.write(db.DB_PATH, arcname="app.db")
        if os.path.exists(EMBEDDINGS_FILE):
            zipf.write(EMBEDDINGS_FILE, arcname="faculty_embeddings.pkl")
        if os.path.exists(FAISS_INDEX_FILE):
            zipf.write(FAISS_INDEX_FILE, arcname="faculty_faiss.index")
        if os.path.isdir(IMAGES_DIR):
            for root, _, files in os.walk(IMAGES_DIR):
                for f in files:
                    full = os.path.join(root, f)
                    rel = os.path.relpath(full, os.path.dirname(IMAGES_DIR))
                    zipf.write(full, arcname=rel)

    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=backup.zip"}
    )

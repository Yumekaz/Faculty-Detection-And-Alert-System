from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import io
import csv

from .. import db
from ..config.config_store import DEFAULT_CONFIG

router = APIRouter()


@router.get("/logs")
async def get_audit_logs(limit: int = 200):
    try:
        db.init_db(DEFAULT_CONFIG)
        rows = db.list_audit_logs(limit=limit if limit > 0 else None)
        return {"logs": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read audit log: {e}")


@router.get("/export")
async def export_audit_log():
    db.init_db(DEFAULT_CONFIG)
    rows = db.list_audit_logs()
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["timestamp", "actor", "action", "status", "details"])
    for row in rows:
        writer.writerow([row["timestamp"], row["actor"], row["action"], row["status"], row["details"]])
    data = buffer.getvalue().encode("utf-8")
    return StreamingResponse(
        io.BytesIO(data),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_log.csv"}
    )

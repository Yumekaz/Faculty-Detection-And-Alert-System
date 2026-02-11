# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- Import Routers from All Microservices ---
from inference.router import router as inference_router
from recognition.router import router as recognition_router
from attendance.router import router as attendance_router
from config.router import router as config_router
from notification.router import router as notification_router
from dvr.router import router as dvr_router
from audit.router import router as audit_router
from corrections.router import router as corrections_router
from health.router import router as health_router
from export.router import router as export_router


# --- Create FastAPI App ---
app = FastAPI(
    title="Faculty Presence Detection Backend",
    version="1.0.0",
    description="Modular AI-powered smart attendance backend with microservice architecture."
)

# --- CORS Middleware (Allow React / Streamlit / Mobile Apps / Deployment) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # In production you can restrict to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health Check ---
@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Faculty Presence Backend Running",
        "services": [
            "/inference",
            "/recognition",
            "/attendance",
            "/config",
            "/notify",
            "/dvr"
        ]
    }


# --- Register Routers ---
app.include_router(inference_router, prefix="/inference", tags=["Inference Service"])
app.include_router(recognition_router, prefix="/recognition", tags=["Recognition Service"])
app.include_router(attendance_router, prefix="/attendance", tags=["Attendance & Schedule Service"])
app.include_router(config_router, prefix="/config", tags=["Configuration Service"])
app.include_router(notification_router, prefix="/notify", tags=["Notification Service"])
app.include_router(dvr_router, prefix="/dvr", tags=["DVR Streaming Service"])
app.include_router(audit_router, prefix="/audit", tags=["Audit Trail"])
app.include_router(corrections_router, prefix="/corrections", tags=["Corrections"])
app.include_router(health_router, tags=["Health"])
app.include_router(export_router, prefix="/export", tags=["Export & Backup"])


# --- Run with Uvicorn ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # remove reload=True in production
    )

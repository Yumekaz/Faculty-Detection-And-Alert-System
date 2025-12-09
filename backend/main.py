# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- Import Routers from All Microservices ---
from inference.router import router as inference_router
from recognition.router import router as recognition_router
from attendance.router import router as attendance_router
from config.router import router as config_router
from notification.router import router as notification_router


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
            "/notify"
        ]
    }


# --- Register Routers ---
app.include_router(inference_router, prefix="/inference", tags=["Inference Service"])
app.include_router(recognition_router, prefix="/recognition", tags=["Recognition Service"])
app.include_router(attendance_router, prefix="/attendance", tags=["Attendance & Schedule Service"])
app.include_router(config_router, prefix="/config", tags=["Configuration Service"])
app.include_router(notification_router, prefix="/notify", tags=["Notification Service"])


# --- Run with Uvicorn ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # remove reload=True in production
    )

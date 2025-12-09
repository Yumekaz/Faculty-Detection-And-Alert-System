from datetime import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional

from . import emailer
from ..config.config_store import load_config

router = APIRouter()

# --- Pydantic Models ---

class EmailPayload(BaseModel):
    subject: str
    body: str
    receiver_email: Optional[str] = None

class AutoNotificationPayload(BaseModel):
    event: str  # "Present", "Absent", "Error"
    name: str
    confidence: float
    faculty: Optional[str] = "Unknown"
    mode: str   # "manual", "auto"

# --- Endpoints ---

@router.post("/notify/send")
async def send_notification(payload: EmailPayload):
    """Generic endpoint to send an email."""
    config = load_config()
    
    sender = config.get("sender_email")
    password = config.get("sender_password")
    receiver = payload.receiver_email or config.get("email_receiver")

    if not sender or not password:
        raise HTTPException(status_code=400, detail="Sender email credentials not configured")

    success = emailer.send_email(sender, password, payload.subject, payload.body, receiver)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email. Check server logs/credentials.")
        
    return {"status": "success", "message": "Email sent"}

@router.post("/notify/test")
async def test_notification():
    """Test email configuration."""
    config = load_config()
    
    sender = config.get("sender_email")
    password = config.get("sender_password")
    receiver = config.get("email_receiver")

    if not sender or not password:
        raise HTTPException(status_code=400, detail="Sender credentials missing in config")

    subject = "Smart Attendance System - Test Email"
    body = "This is a test email from your Smart Attendance System.\n\nIf you are reading this, your email configuration is correct."

    success = emailer.send_email(sender, password, subject, body, receiver)
    
    if not success:
        raise HTTPException(status_code=500, detail="Test email failed")
        
    return {"status": "success", "message": f"Test email sent to {receiver}"}

@router.post("/notify/auto")
async def auto_notification(payload: AutoNotificationPayload, background_tasks: BackgroundTasks):
    """
    Handles automated notifications based on attendance events.
    Checks config.notification_mode to decide whether to send.
    """
    config = load_config()
    mode_setting = config.get("notification_mode", "Absent Only")
    
    # Logic to determine if we should send email
    should_send = False
    
    if mode_setting == "None":
        return {"status": "skipped", "reason": "Notification mode is None"}
    
    if mode_setting == "All (Present & Absent)":
        should_send = True
    elif mode_setting == "Absent Only":
        if payload.event == "Absent" or payload.event == "Error":
            should_send = True
    
    if not should_send:
        return {"status": "skipped", "reason": f"Event '{payload.event}' ignored by mode '{mode_setting}'"}

    # Prepare Email Content
    sender = config.get("sender_email")
    password = config.get("sender_password")
    receiver = config.get("email_receiver")
    
    if not sender or not password:
         return {"status": "skipped", "reason": "Credentials missing"}

    subject = f"Attendance Alert: {payload.event} - {payload.faculty}"
    
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    body = f"""
    Smart Attendance System Alert
    -----------------------------
    Event: {payload.event}
    Target Faculty: {payload.faculty}
    Detected Name: {payload.name}
    Confidence: {payload.confidence:.2f}
    Mode: {payload.mode}

    Time: {current_time}
    """

    # Use background task to avoid blocking the API response
    background_tasks.add_task(emailer.send_email, sender, password, subject, body, receiver)
    
    return {"status": "queued", "message": "Notification queued for delivery"}
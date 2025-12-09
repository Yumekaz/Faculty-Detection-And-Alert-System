import os
import cv2
import time
import pandas as pd
from datetime import datetime
import threading

# Import dependencies from sibling microservices
# Note: These assume the backend package structure is maintained
from ..inference.face_detect import detect_faces_yolo
from ..inference.embeddings import get_face_embedding
from ..recognition.faculty_manager import search_faculty, search_faculty_specific
from ..recognition.faiss_store import load_faculty_database

LOG_FILE = "attendance_log.csv"

# Initialize log file if it doesn't exist
if not os.path.exists(LOG_FILE):
    pd.DataFrame(columns=["timestamp", "status", "name", "confidence", "period", "mode"]).to_csv(LOG_FILE, index=False)

def log_attendance(status, name, confidence, period_info, mode):
    """Logs an attendance entry to the CSV file."""
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Handle period_info format from scheduler
    period_str = "Manual Check"
    if period_info:
        if isinstance(period_info, dict):
            period_str = f"Period {period_info.get('period', 'Unknown')}"
        else:
            period_str = str(period_info)
    
    try:
        # Read, append, and save to avoid file corruption
        try:
            df = pd.read_csv(LOG_FILE)
        except pd.errors.EmptyDataError:
            df = pd.DataFrame(columns=["timestamp", "status", "name", "confidence", "period", "mode"])

        row = {
            "timestamp": ts, 
            "status": status, 
            "name": name, 
            "confidence": f"{confidence:.4f}",
            "period": period_str,
            "mode": mode
        }
        
        # Use concat instead of loc for robustness
        new_row_df = pd.DataFrame([row])
        df = pd.concat([df, new_row_df], ignore_index=True)
        
        df.to_csv(LOG_FILE, index=False)
    except Exception as e:
        print(f"Failed to save to log: {e}")
        pass

def perform_attendance_check(yolo_model, insightface_app, config=None, target_faculty=None, period_info=None, mode="manual"):
    """
    Performs a non-UI attendance check.
    Returns (matched, matched_name, matched_conf)
    """
    if config is None:
        config = {'detection_time': 5, 'threshold': 0.6} # Default config

    # Load latest database state
    faculty_data, faculty_index = load_faculty_database()
    
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW) if os.name == "nt" else cv2.VideoCapture(0)
    if not cap.isOpened(): cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        log_attendance("Error", target_faculty or "Unknown", 0.0, period_info, mode)
        return False, "Camera Error", 0.0

    start_t = time.time()
    detection_time = config.get('detection_time', 30)
    threshold = config.get('threshold', 0.6)
    
    try:
        while time.time() - start_t < detection_time:
            ok, frame = cap.read()
            if not ok: break
            
            faces = detect_faces_yolo(yolo_model, frame)
            
            for face in faces:
                embedding = get_face_embedding(insightface_app, frame, face['bbox'])
                if embedding is None: continue
                
                is_match = False
                name = None
                conf = 0.0

                if target_faculty:
                    is_match, name, conf = search_faculty_specific(
                        faculty_index, faculty_data['names'], 
                        embedding, target_faculty, threshold=threshold
                    )
                else:
                    is_match, name, conf = search_faculty(
                        faculty_index, faculty_data['names'], 
                        embedding, threshold=threshold
                    )
                
                if is_match:
                    cap.release()
                    log_attendance("Present", name, conf, period_info, mode)
                    return True, name, conf
            
            time.sleep(0.1) # Brief pause
            
    finally:
        if cap.isOpened():
            cap.release()
    
    # If loop finishes without match
    log_attendance("Absent", target_faculty or "Unknown", 0.0, period_info, mode)
    return False, None, 0.0

# --- Auto Attendance Loop Logic ---
_stop_event = threading.Event()
_auto_thread = None

def start_auto_attendance_loop(yolo_model, insightface_app, get_current_period_func):
    """Starts the background thread for automated attendance"""
    global _auto_thread, _stop_event
    
    if _auto_thread and _auto_thread.is_alive():
        return False, "Already running"

    _stop_event.clear()
    
    def _loop():
        print("Auto-Attendance Started")
        while not _stop_event.is_set():
            # 1. Get current period
            period = get_current_period_func()
            
            if period:
                print(f"Checking attendance for: {period}")
                # 2. Perform check
                perform_attendance_check(
                    yolo_model, 
                    insightface_app, 
                    config={'detection_time': 10, 'threshold': 0.6},
                    target_faculty=period.get('faculty'),
                    period_info=period,
                    mode="auto"
                )
                # 3. Wait before next check (e.g., 5 minutes or until next period)
                # For demo purposes, we wait 60 seconds to avoid spamming logs
                for _ in range(60): 
                    if _stop_event.is_set(): break
                    time.sleep(1)
            else:
                # No active period, check again in 30 seconds
                for _ in range(30):
                    if _stop_event.is_set(): break
                    time.sleep(1)
        print("Auto-Attendance Stopped")

    _auto_thread = threading.Thread(target=_loop, daemon=True)
    _auto_thread.start()
    return True, "Started"

def stop_auto_attendance_loop():
    """Stops the background thread"""
    global _stop_event
    _stop_event.set()
    return True, "Stopping..."
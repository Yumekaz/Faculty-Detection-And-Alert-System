#!/usr/bin/env python3
"""
Enhanced Mock Backend Server for FPDA System
Simulates all backend endpoints with realistic image processing
"""

import json
import time
import base64
import io
import os
import random
import uuid
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

# Create mock data directories
MOCK_DATA_DIR = os.path.join(os.path.dirname(__file__), 'mock_data')
MOCK_IMAGES_DIR = os.path.join(MOCK_DATA_DIR, 'faculty_images')
os.makedirs(MOCK_IMAGES_DIR, exist_ok=True)

# Mock Data Store
MOCK_DATA = {
    "faculty": [
        {"name": "Dr. Smith", "id": "FAC001", "department": "Computer Science", "image": "smith.jpg"},
        {"name": "Prof. Johnson", "id": "FAC002", "department": "Physics", "image": "johnson.jpg"},
        {"name": "Dr. Williams", "id": "FAC003", "department": "Chemistry", "image": "williams.jpg"},
        {"name": "Prof. Brown", "id": "FAC004", "department": "Mathematics", "image": "brown.jpg"},
    ],
    "embeddings": {},  # name -> embedding vector
    "logs": [
        {"timestamp": datetime.now().isoformat(), "name": "Dr. Smith", "status": "Present", "period": "Period 1", "confidence": 0.95, "mode": "auto"},
        {"timestamp": (datetime.now() - timedelta(hours=1)).isoformat(), "name": "Prof. Johnson", "status": "Present", "period": "Period 1", "confidence": 0.92, "mode": "auto"},
        {"timestamp": (datetime.now() - timedelta(hours=2)).isoformat(), "name": "Dr. Williams", "status": "Absent", "period": "Period 2", "confidence": 0.0, "mode": "auto"},
    ],
    "schedule": [
        {"period": 1, "start": "09:00", "end": "10:00", "faculty": "Dr. Smith", "subject": "Data Structures"},
        {"period": 2, "start": "10:00", "end": "11:00", "faculty": "Prof. Johnson", "subject": "Quantum Physics"},
        {"period": 3, "start": "11:00", "end": "12:00", "faculty": "Dr. Williams", "subject": "Organic Chemistry"},
        {"period": 4, "start": "13:00", "end": "14:00", "faculty": "Prof. Brown", "subject": "Linear Algebra"},
        {"period": 5, "start": "14:00", "end": "15:00", "faculty": "Dr. Smith", "subject": "Algorithms"},
    ],
    "config": {
        "detection_time": 30,
        "threshold": 0.6,
        "sender_email": "admin@college.edu",
        "sender_password": "",
        "email_receiver": "director@college.edu",
        "notification_mode": "Absent Only"
    },
    "health": {
        "status": "healthy",
        "services": {
            "inference": "ok",
            "recognition": "ok",
            "attendance": "ok",
            "database": "ok",
            "camera": "online"
        },
        "timestamp": datetime.now().isoformat()
    },
    "audit_logs": [
        {"timestamp": datetime.now().isoformat(), "event": "login", "user": "admin", "status": "success", "details": "Admin logged in"},
        {"timestamp": (datetime.now() - timedelta(hours=1)).isoformat(), "event": "attendance_check", "user": "system", "status": "success", "details": "Auto check completed"},
        {"timestamp": (datetime.now() - timedelta(hours=2)).isoformat(), "event": "faculty_add", "user": "admin", "status": "success", "details": "Added Dr. Smith"},
    ],
    "corrections": [],
    "alerts": [
        {"id": 1, "type": "absence", "message": "Dr. Williams absent for Period 2", "timestamp": datetime.now().isoformat(), "read": False, "severity": "high"},
        {"id": 2, "type": "late", "message": "Prof. Johnson was 5 minutes late", "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(), "read": True, "severity": "low"},
    ],
    "cameras": [
        {"id": 1, "name": "Main Entrance", "status": "online", "url": "rtsp://mock/cam1", "resolution": "1920x1080", "fps": 30},
        {"id": 2, "name": "Classroom A", "status": "online", "url": "rtsp://mock/cam2", "resolution": "1920x1080", "fps": 30},
        {"id": 3, "name": "Classroom B", "status": "offline", "url": "rtsp://mock/cam3", "resolution": "1280x720", "fps": 25},
    ],
    "auto_attendance_running": False,
    "models_loaded": False
}

# Generate mock embeddings for faculty
def generate_mock_embedding():
    """Generate a random 512-dimensional embedding vector"""
    return [random.gauss(0, 0.1) for _ in range(512)]

# Initialize embeddings for existing faculty
for faculty in MOCK_DATA["faculty"]:
    MOCK_DATA["embeddings"][faculty["name"]] = generate_mock_embedding()

def generate_mock_detection_image():
    """Generate a mock base64 image with face detection boxes"""
    # Create a simple mock image (1x1 pixel PNG)
    mock_png = b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    return base64.b64encode(mock_png).decode()

def similarity_score(emb1, emb2):
    """Calculate cosine similarity between two embeddings"""
    dot_product = sum(a * b for a, b in zip(emb1, emb2))
    norm1 = sum(a * a for a in emb1) ** 0.5
    norm2 = sum(b * b for b in emb2) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return 0
    return dot_product / (norm1 * norm2)

class MockRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress default logging
        pass
    
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_headers()
    
    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        query = urllib.parse.parse_qs(parsed_path.query)
        
        # Root endpoint
        if path == "/":
            self._set_headers()
            response = {
                "status": "ok",
                "message": "Faculty Presence Backend Running (MOCK)",
                "version": "1.0.0",
                "services": [
                    "/inference",
                    "/recognition",
                    "/attendance",
                    "/config",
                    "/notify",
                    "/dvr",
                    "/health",
                    "/audit",
                    "/corrections",
                    "/export"
                ],
                "models_loaded": MOCK_DATA["models_loaded"],
                "auto_attendance": MOCK_DATA["auto_attendance_running"]
            }
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Health endpoints
        if path == "/health":
            self._set_headers()
            MOCK_DATA["health"]["timestamp"] = datetime.now().isoformat()
            self.wfile.write(json.dumps(MOCK_DATA["health"]).encode())
            return
        
        if path == "/health/detailed":
            self._set_headers()
            response = {
                **MOCK_DATA["health"],
                "uptime": "99.9%",
                "memory_usage": "45%",
                "cpu_usage": "32%",
                "disk_usage": "60%",
                "last_backup": (datetime.now() - timedelta(days=1)).isoformat()
            }
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Faculty endpoints
        if path == "/recognition/faculty/list":
            self._set_headers()
            faculty_names = [f["name"] for f in MOCK_DATA["faculty"]]
            self.wfile.write(json.dumps({"faculty": faculty_names, "count": len(faculty_names)}).encode())
            return
        
        # Get faculty details with image
        if path.startswith("/recognition/faculty/details/"):
            self._set_headers()
            name = path.split("/")[-1]
            faculty = next((f for f in MOCK_DATA["faculty"] if f["name"] == name), None)
            if faculty:
                self.wfile.write(json.dumps({"faculty": faculty, "embedding": MOCK_DATA["embeddings"].get(name)}).encode())
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Faculty not found"}).encode())
            return
        
        # Attendance logs
        if path == "/attendance/logs":
            self._set_headers()
            # Filter by date if provided
            logs = MOCK_DATA["logs"]
            if "date" in query:
                date_str = query["date"][0]
                logs = [l for l in logs if l["timestamp"].startswith(date_str)]
            if "faculty" in query:
                faculty = query["faculty"][0]
                logs = [l for l in logs if l["name"] == faculty]
            self.wfile.write(json.dumps({"logs": logs, "count": len(logs)}).encode())
            return
        
        # Schedule endpoints
        if path == "/attendance/schedule/current":
            self._set_headers()
            current_hour = datetime.now().hour
            current_period = None
            for period in MOCK_DATA["schedule"]:
                start_hour = int(period["start"].split(":")[0])
                end_hour = int(period["end"].split(":")[0])
                if start_hour <= current_hour < end_hour:
                    current_period = period
                    break
            self.wfile.write(json.dumps({"period": current_period}).encode())
            return
        
        if path == "/attendance/schedule/next":
            self._set_headers()
            current_hour = datetime.now().hour
            next_period = None
            for period in MOCK_DATA["schedule"]:
                start_hour = int(period["start"].split(":")[0])
                if start_hour > current_hour:
                    next_period = period
                    break
            self.wfile.write(json.dumps({"period": next_period}).encode())
            return
        
        if path == "/attendance/schedule/all":
            self._set_headers()
            self.wfile.write(json.dumps({"schedule": MOCK_DATA["schedule"], "count": len(MOCK_DATA["schedule"])}).encode())
            return
        
        # Config endpoints
        if path == "/config/config":
            self._set_headers()
            self.wfile.write(json.dumps(MOCK_DATA["config"]).encode())
            return
        
        # Audit logs
        if path == "/audit/logs":
            self._set_headers()
            limit = int(query.get("limit", [200])[0])
            logs = MOCK_DATA["audit_logs"][:limit]
            self.wfile.write(json.dumps({"logs": logs, "count": len(logs)}).encode())
            return
        
        # Alerts
        if path == "/notify/alerts":
            self._set_headers()
            unread_only = query.get("unread", ["false"])[0].lower() == "true"
            alerts = MOCK_DATA["alerts"]
            if unread_only:
                alerts = [a for a in alerts if not a["read"]]
            self.wfile.write(json.dumps({"alerts": alerts, "unread_count": sum(1 for a in alerts if not a["read"])}).encode())
            return
        
        # Corrections
        if path == "/corrections/list":
            self._set_headers()
            status = query.get("status", [None])[0]
            corrections = MOCK_DATA["corrections"]
            if status:
                corrections = [c for c in corrections if c["status"] == status]
            self.wfile.write(json.dumps({"corrections": corrections, "count": len(corrections)}).encode())
            return
        
        # DVR/Camera status
        if path == "/dvr/status":
            self._set_headers()
            self.wfile.write(json.dumps({"cameras": MOCK_DATA["cameras"], "count": len(MOCK_DATA["cameras"])}).encode())
            return
        
        # Get camera stream URL
        if path.startswith("/dvr/stream/"):
            self._set_headers()
            cam_id = int(path.split("/")[-1])
            camera = next((c for c in MOCK_DATA["cameras"] if c["id"] == cam_id), None)
            if camera:
                self.wfile.write(json.dumps({
                    "stream_url": f"http://localhost:8000/mock/stream/{cam_id}",
                    "snapshot_url": f"http://localhost:8000/mock/snapshot/{cam_id}",
                    "camera": camera
                }).encode())
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Camera not found"}).encode())
            return
        
        # Get mock snapshot image
        if path.startswith("/mock/snapshot/"):
            self._set_headers(content_type="image/jpeg")
            # Return a mock 1x1 pixel JPEG
            mock_jpeg = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xc4\x00\x1f\x01\x00\x03\x01\x01\x01\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x11\x00\x02\x01\x02\x04\x04\x03\x04\x07\x05\x04\x04\x00\x01\x02w\x00\x01\x02\x03\x11\x04\x05!1\x06\x12AQ\x07aq\x13"2\x81\x08\x14B\x91\xa1\xb1\xc1\t#3R\xf0\x15br\xd1\n\x16$4\xe1%\xf1\x17\x18\x19\x1a&\'()*56789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xfb\xa2\x8a(\x03\xff\xd9'
            self.wfile.write(mock_jpeg)
            return
        
        # DVR Config endpoint
        if path == "/dvr/config":
            self._set_headers()
            self.wfile.write(json.dumps({
                "ip": "192.168.1.68",
                "port": 554,
                "username": "admin",
                "num_cameras": 3,
                "resolution": {"width": 640, "height": 360}
            }).encode())
            return
        
        # DVR Stream endpoint (returns mock MJPEG)
        if path.startswith("/dvr/stream/"):
            self._set_headers(content_type="multipart/x-mixed-replace; boundary=frame")
            # Return a single mock frame
            mock_jpeg = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xfb\xa2\x8a(\x03\xff\xd9'
            self.wfile.write(b'--frame\r\n')
            self.wfile.write(b'Content-Type: image/jpeg\r\n')
            self.wfile.write(f'Content-Length: {len(mock_jpeg)}\r\n\r\n'.encode())
            self.wfile.write(mock_jpeg)
            self.wfile.write(b'\r\n')
            return
        
        # 404 for unknown paths
        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            data = json.loads(body.decode())
        except:
            data = {}
        
        # Faculty add
        if path == "/recognition/faculty/add":
            self._set_headers()
            name = data.get('name', 'Unknown')
            image_base64 = data.get('image_base64', '')
            
            # Check if faculty already exists
            existing = next((f for f in MOCK_DATA["faculty"] if f["name"].lower() == name.lower()), None)
            if existing:
                self.wfile.write(json.dumps({"status": "error", "message": f"Faculty {name} already exists"}).encode())
                return
            
            # Save image if provided
            image_filename = None
            if image_base64:
                try:
                    image_filename = f"{name.replace(' ', '_').lower()}_{uuid.uuid4().hex[:8]}.jpg"
                    image_path = os.path.join(MOCK_IMAGES_DIR, image_filename)
                    with open(image_path, 'wb') as f:
                        f.write(base64.b64decode(image_base64))
                except Exception as e:
                    print(f"Error saving image: {e}")
            
            # Add faculty
            faculty_entry = {
                "name": name,
                "id": f"FAC{len(MOCK_DATA['faculty']) + 1:03d}",
                "department": data.get('department', 'General'),
                "image": image_filename
            }
            MOCK_DATA["faculty"].append(faculty_entry)
            
            # Generate embedding
            MOCK_DATA["embeddings"][name] = generate_mock_embedding()
            
            # Add audit log
            MOCK_DATA["audit_logs"].insert(0, {
                "timestamp": datetime.now().isoformat(),
                "event": "faculty_add",
                "user": "admin",
                "status": "success",
                "details": f"Added {name}"
            })
            
            self.wfile.write(json.dumps({
                "status": "success",
                "message": f"Added {name}",
                "faculty": faculty_entry,
                "embedding_generated": True
            }).encode())
            return
        
        # Faculty delete
        if path == "/recognition/faculty/delete":
            self._set_headers()
            name = data.get('name', '')
            faculty = next((f for f in MOCK_DATA["faculty"] if f["name"].lower() == name.lower()), None)
            
            if not faculty:
                self._set_headers(404)
                self.wfile.write(json.dumps({"status": "error", "message": f"Faculty {name} not found"}).encode())
                return
            
            # Remove faculty
            MOCK_DATA["faculty"] = [f for f in MOCK_DATA["faculty"] if f["name"].lower() != name.lower()]
            if name in MOCK_DATA["embeddings"]:
                del MOCK_DATA["embeddings"][name]
            
            # Add audit log
            MOCK_DATA["audit_logs"].insert(0, {
                "timestamp": datetime.now().isoformat(),
                "event": "faculty_delete",
                "user": "admin",
                "status": "success",
                "details": f"Deleted {name}"
            })
            
            self.wfile.write(json.dumps({"status": "success", "message": f"Deleted {name}"}).encode())
            return
        
        # Faculty search
        if path == "/recognition/faculty/search":
            self._set_headers()
            embedding = data.get('embedding', [])
            threshold = MOCK_DATA["config"].get("threshold", 0.6)
            
            if not embedding or len(embedding) != 512:
                self.wfile.write(json.dumps({
                    "matched": False,
                    "name": None,
                    "confidence": 0.0,
                    "message": "Invalid embedding"
                }).encode())
                return
            
            # Find best match
            best_match = None
            best_score = -1
            
            for name, stored_embedding in MOCK_DATA["embeddings"].items():
                score = similarity_score(embedding, stored_embedding)
                if score > best_score:
                    best_score = score
                    best_match = name
            
            matched = best_score >= threshold
            
            self.wfile.write(json.dumps({
                "matched": matched,
                "name": best_match if matched else None,
                "confidence": round(best_score, 4),
                "threshold": threshold
            }).encode())
            return
        
        # Faculty search-specific
        if path == "/recognition/faculty/search-specific":
            self._set_headers()
            embedding = data.get('embedding', [])
            target_name = data.get('target_name', '')
            threshold = MOCK_DATA["config"].get("threshold", 0.6)
            
            if target_name not in MOCK_DATA["embeddings"]:
                self.wfile.write(json.dumps({
                    "matched": False,
                    "name": None,
                    "confidence": 0.0,
                    "message": "Target faculty not found"
                }).encode())
                return
            
            stored_embedding = MOCK_DATA["embeddings"][target_name]
            score = similarity_score(embedding, stored_embedding)
            matched = score >= threshold
            
            self.wfile.write(json.dumps({
                "matched": matched,
                "name": target_name if matched else None,
                "confidence": round(score, 4),
                "threshold": threshold
            }).encode())
            return
        
        # Clear faculty DB
        if path == "/recognition/faculty/clear-db":
            self._set_headers()
            count = len(MOCK_DATA["faculty"])
            MOCK_DATA["faculty"] = []
            MOCK_DATA["embeddings"] = {}
            
            # Clean up images
            for f in os.listdir(MOCK_IMAGES_DIR):
                os.remove(os.path.join(MOCK_IMAGES_DIR, f))
            
            MOCK_DATA["audit_logs"].insert(0, {
                "timestamp": datetime.now().isoformat(),
                "event": "faculty_clear_db",
                "user": "admin",
                "status": "success",
                "details": f"Cleared {count} faculty members"
            })
            
            self.wfile.write(json.dumps({
                "status": "success",
                "message": f"Database cleared. Removed {count} faculty members.",
                "errors": []
            }).encode())
            return
        
        # Manual attendance check
        if path == "/attendance/manual":
            self._set_headers()
            target_faculty = data.get('target_faculty')
            
            # Simulate detection
            if target_faculty and target_faculty in MOCK_DATA["embeddings"]:
                matched = True
                name = target_faculty
                confidence = round(random.uniform(0.85, 0.98), 4)
            else:
                # Random match
                if MOCK_DATA["faculty"] and random.random() > 0.2:
                    matched = True
                    name = random.choice(MOCK_DATA["faculty"])["name"]
                    confidence = round(random.uniform(0.75, 0.95), 4)
                else:
                    matched = False
                    name = None
                    confidence = 0.0
            
            # Get current period
            current_hour = datetime.now().hour
            period = None
            for p in MOCK_DATA["schedule"]:
                start_hour = int(p["start"].split(":")[0])
                end_hour = int(p["end"].split(":")[0])
                if start_hour <= current_hour < end_hour:
                    period = f"Period {p['period']}"
                    break
            
            # Log the attendance
            if matched and name:
                log_entry = {
                    "timestamp": datetime.now().isoformat(),
                    "name": name,
                    "status": "Present",
                    "period": period,
                    "confidence": confidence,
                    "mode": "manual"
                }
                MOCK_DATA["logs"].insert(0, log_entry)
            
            self.wfile.write(json.dumps({
                "matched": matched,
                "name": name,
                "confidence": confidence,
                "period": period
            }).encode())
            return
        
        # Start auto attendance
        if path == "/attendance/auto/start":
            self._set_headers()
            if MOCK_DATA["auto_attendance_running"]:
                self.wfile.write(json.dumps({"status": "error", "message": "Auto attendance already running"}).encode())
                return
            
            MOCK_DATA["auto_attendance_running"] = True
            MOCK_DATA["health"]["services"]["attendance"] = "running"
            
            MOCK_DATA["audit_logs"].insert(0, {
                "timestamp": datetime.now().isoformat(),
                "event": "attendance_auto_start",
                "user": "system",
                "status": "success",
                "details": "Auto attendance started"
            })
            
            self.wfile.write(json.dumps({"status": "success", "message": "Auto attendance started"}).encode())
            return
        
        # Stop auto attendance
        if path == "/attendance/auto/stop":
            self._set_headers()
            if not MOCK_DATA["auto_attendance_running"]:
                self.wfile.write(json.dumps({"status": "error", "message": "Auto attendance not running"}).encode())
                return
            
            MOCK_DATA["auto_attendance_running"] = False
            MOCK_DATA["health"]["services"]["attendance"] = "ok"
            
            MOCK_DATA["audit_logs"].insert(0, {
                "timestamp": datetime.now().isoformat(),
                "event": "attendance_auto_stop",
                "user": "system",
                "status": "success",
                "details": "Auto attendance stopped"
            })
            
            self.wfile.write(json.dumps({"status": "success", "message": "Auto attendance stopped"}).encode())
            return
        
        # Clear logs
        if path == "/attendance/logs/clear":
            self._set_headers()
            count = len(MOCK_DATA["logs"])
            MOCK_DATA["logs"] = []
            
            MOCK_DATA["audit_logs"].insert(0, {
                "timestamp": datetime.now().isoformat(),
                "event": "attendance_logs_clear",
                "user": "system",
                "status": "success",
                "details": f"Cleared {count} logs"
            })
            
            self.wfile.write(json.dumps({"status": "success", "message": f"Logs cleared ({count} entries)"}).encode())
            return
        
        # Update schedule
        if path == "/attendance/schedule/update":
            self._set_headers()
            schedule = data.get('schedule', [])
            MOCK_DATA["schedule"] = schedule
            
            MOCK_DATA["audit_logs"].insert(0, {
                "timestamp": datetime.now().isoformat(),
                "event": "schedule_update",
                "user": "admin",
                "status": "success",
                "details": f"Updated schedule with {len(schedule)} periods"
            })
            
            self.wfile.write(json.dumps({"status": "success", "message": "Schedule updated"}).encode())
            return
        
        # Update config
        if path == "/config/config/update":
            self._set_headers()
            MOCK_DATA["config"].update(data)
            
            MOCK_DATA["audit_logs"].insert(0, {
                "timestamp": datetime.now().isoformat(),
                "event": "config_update",
                "user": "admin",
                "status": "success",
                "details": f"Updated config: {list(data.keys())}"
            })
            
            self.wfile.write(json.dumps({
                "status": "success",
                "message": "Config updated",
                "config": MOCK_DATA["config"]
            }).encode())
            return
        
        # Reset config
        if path == "/config/config/reset":
            self._set_headers()
            MOCK_DATA["config"] = {
                "detection_time": 30,
                "threshold": 0.6,
                "sender_email": "",
                "sender_password": "",
                "email_receiver": "",
                "notification_mode": "Absent Only"
            }
            
            MOCK_DATA["audit_logs"].insert(0, {
                "timestamp": datetime.now().isoformat(),
                "event": "config_reset",
                "user": "admin",
                "status": "success",
                "details": "Config reset to defaults"
            })
            
            self.wfile.write(json.dumps({
                "status": "success",
                "message": "Config reset",
                "config": MOCK_DATA["config"]
            }).encode())
            return
        
        # Inference - Init models
        if path == "/inference/init-models":
            self._set_headers()
            MOCK_DATA["models_loaded"] = True
            MOCK_DATA["health"]["services"]["inference"] = "loaded"
            
            self.wfile.write(json.dumps({
                "status": "success",
                "message": "Models initialized successfully",
                "models": ["yolov8-face", "insightface-buffalo_l"]
            }).encode())
            return
        
        # Inference - Detect faces
        if path == "/inference/detect-faces":
            self._set_headers()
            
            if not MOCK_DATA["models_loaded"]:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Models not initialized. Call /inference/init-models first"}).encode())
                return
            
            # Simulate face detection
            num_faces = random.randint(0, 3)
            faces = []
            for i in range(num_faces):
                x = random.randint(50, 400)
                y = random.randint(50, 300)
                w = random.randint(80, 150)
                h = random.randint(100, 180)
                faces.append({
                    "bbox": [x, y, x + w, y + h],
                    "confidence": round(random.uniform(0.8, 0.99), 4)
                })
            
            self.wfile.write(json.dumps({
                "faces": faces,
                "count": len(faces),
                "processing_time": round(random.uniform(0.05, 0.2), 3)
            }).encode())
            return
        
        # Inference - Extract embedding
        if path == "/inference/extract-embedding":
            self._set_headers()
            
            if not MOCK_DATA["models_loaded"]:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Models not initialized"}).encode())
                return
            
            # Generate a mock 512-dimensional embedding
            embedding = generate_mock_embedding()
            
            self.wfile.write(json.dumps({
                "embedding": embedding,
                "dimensions": 512,
                "processing_time": round(random.uniform(0.02, 0.1), 3)
            }).encode())
            return
        
        # Send test email
        if path == "/notify/test-email":
            self._set_headers()
            
            MOCK_DATA["audit_logs"].insert(0, {
                "timestamp": datetime.now().isoformat(),
                "event": "test_email",
                "user": "admin",
                "status": "success",
                "details": "Test email sent"
            })
            
            self.wfile.write(json.dumps({
                "status": "success",
                "message": "Test email sent successfully",
                "recipient": MOCK_DATA["config"].get("email_receiver", "")
            }).encode())
            return
        
        # Mark alert as read
        if path == "/notify/alerts/read":
            self._set_headers()
            alert_id = data.get('alert_id')
            for alert in MOCK_DATA["alerts"]:
                if alert["id"] == alert_id:
                    alert["read"] = True
            
            self.wfile.write(json.dumps({"status": "success", "alert_id": alert_id}).encode())
            return
        
        # Request correction
        if path == "/corrections/request":
            self._set_headers()
            correction = {
                "id": len(MOCK_DATA["corrections"]) + 1,
                **data,
                "status": "pending",
                "timestamp": datetime.now().isoformat()
            }
            MOCK_DATA["corrections"].append(correction)
            
            self.wfile.write(json.dumps({"status": "success", "correction": correction}).encode())
            return
        
        # Approve correction
        if path == "/corrections/approve":
            self._set_headers()
            correction_id = data.get('correction_id')
            for c in MOCK_DATA["corrections"]:
                if c["id"] == correction_id:
                    c["status"] = "approved"
                    c["reviewed_at"] = datetime.now().isoformat()
            
            self.wfile.write(json.dumps({"status": "success", "correction_id": correction_id}).encode())
            return
        
        # Reject correction
        if path == "/corrections/reject":
            self._set_headers()
            correction_id = data.get('correction_id')
            for c in MOCK_DATA["corrections"]:
                if c["id"] == correction_id:
                    c["status"] = "rejected"
                    c["reviewed_at"] = datetime.now().isoformat()
            
            self.wfile.write(json.dumps({"status": "success", "correction_id": correction_id}).encode())
            return
        
        # DVR Connect
        if path == "/dvr/connect":
            self._set_headers()
            # Simulate connecting to cameras
            for cam in MOCK_DATA["cameras"]:
                cam["status"] = "online"
            
            self.wfile.write(json.dumps({
                "status": "success",
                "message": "Connected to DVR",
                "cameras": {str(c["id"]): c["status"] == "online" for c in MOCK_DATA["cameras"]},
                "active_cameras": len(MOCK_DATA["cameras"]),
                "total_cameras": len(MOCK_DATA["cameras"])
            }).encode())
            return
        
        # DVR Disconnect
        if path == "/dvr/disconnect":
            self._set_headers()
            for cam in MOCK_DATA["cameras"]:
                cam["status"] = "offline"
            
            self.wfile.write(json.dumps({
                "status": "success",
                "message": "Disconnected from DVR"
            }).encode())
            return
        
        # DVR Config Save
        if path == "/dvr/config":
            self._set_headers()
            # Update config (mock)
            self.wfile.write(json.dumps({
                "status": "success",
                "message": "Configuration saved"
            }).encode())
            return
        
        # DVR Snapshot
        if path == "/dvr/snapshot":
            self._set_headers(content_type="image/jpeg")
            mock_jpeg = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xfb\xa2\x8a(\x03\xff\xd9'
            self.wfile.write(mock_jpeg)
            return
        
        # Export data
        if path == "/export/attendance":
            self._set_headers()
            self.wfile.write(json.dumps({
                "status": "success",
                "download_url": f"{BASE_URL}/mock/export/attendance_{datetime.now().strftime('%Y%m%d')}.csv",
                "records": len(MOCK_DATA["logs"]),
                "format": "CSV"
            }).encode())
            return
        
        # 404 for unknown paths
        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Not found"}).encode())
    
    def do_PATCH(self):
        # Handle PATCH same as POST for config updates
        return self.do_POST()

if __name__ == "__main__":
    server = HTTPServer(('localhost', 8000), MockRequestHandler)
    print("="*70)
    print("FPDA Mock Backend Server")
    print("="*70)
    print(f"Running at: http://localhost:8000")
    print(f"Mock data directory: {MOCK_DATA_DIR}")
    print()
    print("Technology Stack (Simulated):")
    print("  - YOLOv8 for face detection")
    print("  - InsightFace for face embeddings")
    print("  - FAISS for vector similarity search")
    print("  - OpenCV for image processing")
    print()
    print("Features:")
    print("  - Image upload and storage")
    print("  - Face detection with bounding boxes")
    print("  - 512-dim embedding extraction")
    print("  - Cosine similarity matching")
    print("  - Camera stream simulation")
    print("  - Automated attendance")
    print()
    print("Press Ctrl+C to stop")
    print("="*70)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")

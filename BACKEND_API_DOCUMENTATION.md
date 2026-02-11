# FPDA Backend API Documentation

## Overview
The Faculty Presence Detection & Attendance (FPDA) backend provides a comprehensive REST API for face recognition-based attendance tracking.

**Base URL:** `http://localhost:8000`  
**CORS:** Enabled for all origins (`*`)

---

## 🏥 Health & Status

### Check System Health
```
GET /health
GET /health/detailed
```

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "inference": "ok",
    "recognition": "ok",
    "attendance": "ok",
    "database": "ok"
  },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

## 👤 Faculty Management (/recognition)

### List All Faculty
```
GET /recognition/faculty/list
```

**Response:**
```json
{
  "faculty": ["Dr. Smith", "Prof. Johnson", "Dr. Williams"]
}
```

### Add New Faculty
```
POST /recognition/faculty/add
Content-Type: application/json

{
  "name": "Dr. Smith",
  "image_base64": "base64encodedstring..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Added Dr. Smith"
}
```

### Delete Faculty
```
POST /recognition/faculty/delete
Content-Type: application/json

{
  "name": "Dr. Smith"
}
```

### Search Faculty by Embedding
```
POST /recognition/faculty/search
Content-Type: application/json

{
  "embedding": [0.1, 0.2, ...]  // 512-dimensional vector
}
```

**Response:**
```json
{
  "matched": true,
  "name": "Dr. Smith",
  "confidence": 0.95
}
```

### Search Specific Faculty
```
POST /recognition/faculty/search-specific
Content-Type: application/json

{
  "embedding": [0.1, 0.2, ...],
  "target_name": "Dr. Smith"
}
```

### Clear Faculty Database
```
POST /recognition/faculty/clear-db
```

---

## 📋 Attendance (/attendance)

### Get Attendance Logs
```
GET /attendance/logs
```

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2024-01-01T09:00:00",
      "name": "Dr. Smith",
      "status": "Present",
      "period": "Period 1",
      "confidence": 0.95
    }
  ]
}
```

### Manual Attendance Check
```
POST /attendance/manual
Content-Type: application/json

{
  "target_faculty": "Dr. Smith"  // Optional
}
```

**Response:**
```json
{
  "matched": true,
  "name": "Dr. Smith",
  "confidence": 0.92
}
```

### Start Auto Attendance
```
POST /attendance/auto/start
```

**Response:**
```json
{
  "status": "success",
  "message": "Auto attendance started"
}
```

### Stop Auto Attendance
```
POST /attendance/auto/stop
```

### Clear Logs
```
POST /attendance/logs/clear
```

---

## 📅 Schedule (/attendance/schedule)

### Get Current Period
```
GET /attendance/schedule/current
```

**Response:**
```json
{
  "period": {
    "period": 1,
    "start": "09:00",
    "end": "10:00",
    "faculty": "Dr. Smith",
    "subject": "Mathematics"
  }
}
```

### Get Next Period
```
GET /attendance/schedule/next
```

### Get Full Schedule
```
GET /attendance/schedule/all
```

**Response:**
```json
{
  "schedule": [
    {
      "period": 1,
      "start": "09:00",
      "end": "10:00",
      "faculty": "Dr. Smith",
      "subject": "Mathematics"
    }
  ]
}
```

### Update Schedule
```
POST /attendance/schedule/update
Content-Type: application/json

{
  "schedule": [
    {
      "period": 1,
      "start": "09:00",
      "end": "10:00",
      "faculty": "Dr. Smith",
      "subject": "Mathematics"
    }
  ]
}
```

---

## ⚙️ Configuration (/config)

### Get Configuration
```
GET /config/config
```

**Response:**
```json
{
  "detection_time": 30,
  "threshold": 0.6,
  "sender_email": "admin@college.edu",
  "sender_password": "",
  "email_receiver": "director@college.edu",
  "notification_mode": "Absent Only"
}
```

### Update Configuration
```
POST /config/config/update
PATCH /config/config/update
Content-Type: application/json

{
  "detection_time": 45,
  "threshold": 0.7
}
```

### Reset Configuration
```
POST /config/config/reset
```

---

## 🧠 Inference (/inference)

### Initialize Models
```
POST /inference/init-models
```

**Response:**
```json
{
  "status": "success",
  "message": "Models initialized"
}
```

### Detect Faces
```
POST /inference/detect-faces
Content-Type: application/json

{
  "image_base64": "base64encodedstring..."
}
```

**Response:**
```json
{
  "faces": [
    {
      "bbox": [100, 100, 200, 200],
      "confidence": 0.95
    }
  ]
}
```

### Extract Embedding
```
POST /inference/extract-embedding
Content-Type: application/json

{
  "image_base64": "base64encodedstring...",
  "bbox": [100, 100, 200, 200]
}
```

**Response:**
```json
{
  "embedding": [0.1, 0.2, ...]  // 512-dimensional vector
}
```

---

## 🔔 Notifications (/notify)

### Get Alerts
```
GET /notify/alerts
```

**Response:**
```json
{
  "alerts": [
    {
      "id": 1,
      "type": "absence",
      "message": "Dr. Williams absent for Period 2",
      "timestamp": "2024-01-01T10:00:00",
      "read": false
    }
  ]
}
```

### Mark Alert as Read
```
POST /notify/alerts/read
Content-Type: application/json

{
  "alert_id": 1
}
```

### Send Test Email
```
POST /notify/test-email
```

---

## 📝 Corrections (/corrections)

### List Corrections
```
GET /corrections/list
```

### Request Correction
```
POST /corrections/request
Content-Type: application/json

{
  "faculty": "Dr. Smith",
  "date": "2024-01-01",
  "period": "Period 1",
  "reason": "Was present but marked absent"
}
```

### Approve Correction
```
POST /corrections/approve
Content-Type: application/json

{
  "correction_id": 1
}
```

### Reject Correction
```
POST /corrections/reject
Content-Type: application/json

{
  "correction_id": 1
}
```

---

## 📹 DVR/Cameras (/dvr)

### Get Camera Status
```
GET /dvr/status
```

**Response:**
```json
{
  "cameras": [
    {
      "id": 1,
      "name": "Camera 1",
      "status": "online",
      "url": "rtsp://example.com/cam1"
    }
  ]
}
```

---

## 📊 Audit (/audit)

### Get Audit Logs
```
GET /audit/logs
```

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2024-01-01T00:00:00",
      "event": "login",
      "user": "admin",
      "status": "success"
    }
  ]
}
```

---

## 📤 Export (/export)

### Export Attendance
```
POST /export/attendance
```

**Response:**
```json
{
  "status": "success",
  "download_url": "/export/attendance.csv",
  "records": 100
}
```

---

## Frontend API Client Files

The frontend has the following API client modules in `frontend/app/api/`:

| File | Description |
|------|-------------|
| `attendance.ts` | Attendance checks and logs |
| `recognition.ts` | Faculty management |
| `schedule.ts` | Schedule management |
| `config.ts` | System configuration |
| `inference.ts` | Face detection & embeddings |
| `corrections.ts` | Correction requests |
| `audit.ts` | Audit trail |
| `export.ts` | Data export |

---

## Testing

Run the mock backend:
```bash
python mock_backend.py
```

Test all endpoints:
```bash
python test_frontend_api.py
```

---

## Notes

- All endpoints return JSON responses
- CORS is enabled for all origins
- Authentication is handled at the frontend level (mock users)
- The real backend requires Python dependencies (FastAPI, OpenCV, etc.)
- This mock backend simulates all responses for frontend development

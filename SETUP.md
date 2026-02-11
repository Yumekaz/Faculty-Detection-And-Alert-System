# Faculty Presence Detection & Alert System (FPDA)

AI-powered smart attendance system with face recognition, DVR integration, and real-time notifications.

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** 
- **Git**

---

## Quick Setup

### 1. Clone & Navigate
```bash
cd "c:\Users\Mihir\OneDrive\Desktop\facul - v1"
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r ../requirements.txt

# Start server
python main.py
```
Backend runs at: **http://localhost:8000**

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```
Frontend runs at: **http://localhost:3000**

---

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Director | director | director123 |
| HOD | hod | hod123 |
| Faculty | faculty | faculty123 |

> *Check `frontend/lib/constants.ts` for actual demo credentials*

---

## Services & Endpoints

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Web dashboard |
| Backend API | http://localhost:8000 | FastAPI server |
| API Docs | http://localhost:8000/docs | Swagger UI |

---

## Admin Features

| Page | Description |
|------|-------------|
| Dashboard | Overview & stats |
| Faculty Management | Add/edit faculty profiles |
| Schedules | Configure class schedules |
| **Cameras** | DVR live stream viewer |
| Configuration | System settings |
| System Health | Service status |
| System Logs | Attendance logs |
| **System Test** | Full system diagnostics |

---

## DVR Configuration

Default settings (edit in `backend/dvr_config.json`):
```json
{
  "ip": "192.168.1.68",
  "port": 554,
  "username": "admin",
  "password": "hik@4455",
  "num_cameras": 3
}
```

---

## Troubleshooting

**Backend won't start?**
```bash
pip install -r requirements.txt --upgrade
```

**Frontend errors?**
```bash
cd frontend
rm -rf node_modules
npm install
```

**Models not loading?**
- First request to `/inference/init-models` may take 30-60 seconds
- Requires ~2GB RAM for YOLO + InsightFace

---

## Project Structure

```
facul - v1/
├── backend/
│   ├── main.py           # FastAPI entry point
│   ├── inference/        # AI models (YOLO, InsightFace)
│   ├── recognition/      # Face recognition
│   ├── attendance/       # Attendance logic
│   ├── config/           # System config
│   ├── notification/     # Email alerts
│   └── dvr/              # Camera streaming
├── frontend/
│   ├── app/              # Next.js pages
│   ├── components/       # UI components
│   └── lib/              # Utilities
└── requirements.txt
```

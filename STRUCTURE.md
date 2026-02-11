# Project Structure

Complete file-by-file breakdown of the Faculty Presence Detection & Alert System.

---

## Root Directory

```
facul - v1/
├── .gitignore              # Git ignore patterns
├── Dockerfile              # Docker container config
├── docker-compose.yaml     # Multi-container orchestration
├── requirements.txt        # Python dependencies
├── SETUP.md                # Setup guide
├── STRUCTURE.md            # This file
├── FacultyPresence.postman_collection.json  # API testing collection
├── backend/                # FastAPI backend
└── frontend/               # Next.js frontend
```

---

## Backend Structure

```
backend/
├── main.py                 # FastAPI entry point, router registration
├── __init__.py             # Package init
├── attendance_log.csv      # Attendance records (auto-generated)
├── schedule.json           # Class schedule data
├── system_config.json      # System configuration
│
├── attendance/             # Attendance Service
│   ├── __init__.py
│   ├── attendance_engine.py  # Core attendance logic, camera capture
│   ├── router.py             # API: manual/auto attendance, logs
│   └── scheduler.py          # Period/schedule management
│
├── config/                 # Configuration Service
│   ├── __init__.py
│   ├── config_store.py       # Config load/save utilities
│   └── router.py             # API: get/update config
│
├── dvr/                    # DVR Camera Service
│   ├── __init__.py
│   ├── config.py             # DVR settings, RTSP URL generation
│   ├── router.py             # API: connect, stream, snapshot
│   └── streaming.py          # DVRStreamManager, MJPEG streaming
│
├── inference/              # AI Inference Service
│   ├── __init__.py
│   ├── embeddings.py         # Face embedding extraction
│   ├── face_detect.py        # YOLO face detection
│   ├── model_loader.py       # Load YOLO + InsightFace models
│   └── router.py             # API: init-models, detect-faces, extract-embedding
│
├── models/                 # AI Model Weights
│   ├── yolov8n.pt            # YOLOv8 nano (fast)
│   └── yolov8s.pt            # YOLOv8 small (accurate)
│
├── notification/           # Notification Service
│   ├── __init__.py
│   ├── emailer.py            # SMTP email sending
│   └── router.py             # API: send/test notifications
│
├── recognition/            # Face Recognition Service
│   ├── __init__.py
│   ├── faculty_manager.py    # Faculty CRUD operations
│   ├── faiss_store.py        # FAISS vector database
│   └── router.py             # API: list/add/delete faculty
│
└── faculty_db/             # Faculty face data storage
```

---

## Frontend Structure

```
frontend/
├── package.json            # Node dependencies & scripts
├── tsconfig.json           # TypeScript config
├── next.config.js          # Next.js config
├── tailwind.config.js      # TailwindCSS config
├── postcss.config.js       # PostCSS config
├── next-env.d.ts           # Next.js type definitions
│
├── app/                    # Next.js App Router
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Login page
│   │
│   ├── api/                  # API wrapper functions
│   │   ├── attendance.ts       # Attendance API calls
│   │   ├── config.ts           # Config API calls
│   │   ├── inference.ts        # Inference API calls
│   │   ├── recognition.ts      # Recognition API calls
│   │   └── schedule.ts         # Schedule API calls
│   │
│   └── dashboard/            # Dashboard pages
│       ├── layout.tsx          # Dashboard layout with sidebar
│       ├── page.tsx            # Main dashboard
│       ├── alerts/page.tsx     # Alerts view
│       ├── cameras/page.tsx    # DVR camera viewer
│       ├── faculty/page.tsx    # Faculty management
│       ├── health/page.tsx     # System health check
│       ├── logs/page.tsx       # Attendance logs
│       ├── schedules/page.tsx  # Schedule management
│       ├── settings/page.tsx   # System configuration
│       └── test/page.tsx       # System test runner
│
├── components/             # Reusable Components
│   ├── layout/
│   │   ├── DashboardLayout.tsx # Dashboard wrapper
│   │   └── Sidebar.tsx         # Navigation sidebar
│   │
│   └── ui/                   # UI Components
│       ├── index.ts            # Barrel export
│       ├── Alert.tsx           # Alert/notification component
│       ├── Badge.tsx           # Status badges
│       ├── Button.tsx          # Button variants
│       ├── Card.tsx            # Card container
│       ├── Header.tsx          # Page headers
│       ├── Input.tsx           # Form inputs
│       ├── Modal.tsx           # Modal dialogs
│       ├── Select.tsx          # Dropdown select
│       ├── StatCard.tsx        # Statistics cards
│       ├── StatusDot.tsx       # Status indicators
│       ├── Table.tsx           # Data tables
│       └── Tabs.tsx            # Tab navigation
│
├── lib/                    # Utilities
│   ├── auth-context.tsx      # Authentication context
│   ├── constants.ts          # App constants, roles
│   └── utils.ts              # Helper functions
│
├── styles/
│   └── globals.css           # Global styles
│
└── public/                 # Static assets
    ├── logo.png              # App logo (PNG)
    └── logo.svg              # App logo (SVG)
```

---

## API Endpoints Summary

### Inference Service (`/inference`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/init-models` | POST | Load YOLO + InsightFace |
| `/detect-faces` | POST | Detect faces in image |
| `/extract-embedding` | POST | Get face embedding vector |

### Recognition Service (`/recognition`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/list` | GET | List all faculty |
| `/add` | POST | Add new faculty |
| `/delete/{name}` | DELETE | Remove faculty |

### Attendance Service (`/attendance`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/attendance/manual` | POST | Trigger manual check |
| `/attendance/auto/start` | POST | Start auto attendance |
| `/attendance/auto/stop` | POST | Stop auto attendance |
| `/attendance/logs` | GET | Get attendance logs |
| `/schedule/all` | GET | Get full schedule |

### Config Service (`/config`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Get system config |
| `/` | POST | Update config |

### Notification Service (`/notify`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/notify/send` | POST | Send email |
| `/notify/test` | POST | Test email config |

### DVR Service (`/dvr`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | GET | Camera status |
| `/config` | GET/POST | DVR configuration |
| `/connect` | POST | Connect to cameras |
| `/disconnect` | POST | Disconnect cameras |
| `/stream/{ch}` | GET | MJPEG stream |
| `/snapshot` | POST | Capture snapshot |

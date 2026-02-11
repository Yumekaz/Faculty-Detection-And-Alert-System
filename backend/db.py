import csv
import json
import os
import sqlite3
from typing import List, Dict, Optional

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(_BACKEND_DIR, "app.db")

# Legacy file paths for one-time migration
_CONFIG_FILE = os.path.join(_BACKEND_DIR, "system_config.json")
_SCHEDULE_FILE = os.path.join(_BACKEND_DIR, "schedule.json")
_ATTENDANCE_LOG = os.path.join(_BACKEND_DIR, "attendance_log.csv")
_AUDIT_LOG = os.path.join(_BACKEND_DIR, "audit_log.csv")
_CORRECTIONS_FILE = os.path.join(_BACKEND_DIR, "corrections.json")

_SCHEMA = """
CREATE TABLE IF NOT EXISTS config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  detection_time INTEGER NOT NULL,
  threshold REAL NOT NULL,
  sender_email TEXT NOT NULL,
  sender_password TEXT NOT NULL,
  email_receiver TEXT NOT NULL,
  notification_mode TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS schedule (
  period INTEGER PRIMARY KEY,
  start TEXT NOT NULL,
  end TEXT NOT NULL,
  faculty TEXT NOT NULL,
  subject TEXT
);

CREATE TABLE IF NOT EXISTS attendance_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL,
  name TEXT,
  confidence REAL,
  period TEXT,
  mode TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS corrections (
  id TEXT PRIMARY KEY,
  faculty_name TEXT NOT NULL,
  date TEXT NOT NULL,
  period TEXT,
  reason TEXT NOT NULL,
  requester TEXT NOT NULL,
  status TEXT NOT NULL,
  reviewer TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
"""


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(default_config: Dict):
    conn = _connect()
    try:
        conn.executescript(_SCHEMA)
        _migrate_from_files(conn, default_config)
        conn.commit()
    finally:
        conn.close()


def _table_empty(conn: sqlite3.Connection, table: str) -> bool:
    cur = conn.execute(f"SELECT COUNT(1) AS c FROM {table}")
    row = cur.fetchone()
    return row["c"] == 0


def _migrate_from_files(conn: sqlite3.Connection, default_config: Dict):
    # Config
    if _table_empty(conn, "config"):
        config = default_config.copy()
        if os.path.exists(_CONFIG_FILE):
            try:
                with open(_CONFIG_FILE, "r", encoding="utf-8") as f:
                    config.update(json.load(f))
            except Exception:
                pass
        conn.execute(
            "INSERT OR REPLACE INTO config (id, detection_time, threshold, sender_email, sender_password, email_receiver, notification_mode) VALUES (1,?,?,?,?,?,?)",
            (
                config.get("detection_time", 30),
                config.get("threshold", 0.6),
                config.get("sender_email", ""),
                config.get("sender_password", ""),
                config.get("email_receiver", ""),
                config.get("notification_mode", "Absent Only"),
            ),
        )

    # Schedule
    if _table_empty(conn, "schedule"):
        data = []
        if os.path.exists(_SCHEDULE_FILE):
            try:
                with open(_SCHEDULE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                data = []
        for item in data:
            conn.execute(
                "INSERT OR REPLACE INTO schedule (period, start, end, faculty, subject) VALUES (?,?,?,?,?)",
                (
                    int(item.get("period", 0)),
                    item.get("start", "09:00"),
                    item.get("end", "10:00"),
                    item.get("faculty", "Unknown"),
                    item.get("subject"),
                ),
            )

    # Attendance logs
    if _table_empty(conn, "attendance_logs") and os.path.exists(_ATTENDANCE_LOG):
        try:
            with open(_ATTENDANCE_LOG, "r", newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    conn.execute(
                        "INSERT INTO attendance_logs (timestamp, status, name, confidence, period, mode) VALUES (?,?,?,?,?,?)",
                        (
                            row.get("timestamp"),
                            row.get("status"),
                            row.get("name"),
                            _to_float(row.get("confidence")),
                            row.get("period"),
                            row.get("mode") or "manual",
                        ),
                    )
        except Exception:
            pass

    # Audit logs
    if _table_empty(conn, "audit_logs") and os.path.exists(_AUDIT_LOG):
        try:
            with open(_AUDIT_LOG, "r", newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    conn.execute(
                        "INSERT INTO audit_logs (timestamp, actor, action, status, details) VALUES (?,?,?,?,?)",
                        (
                            row.get("timestamp"),
                            row.get("actor"),
                            row.get("action"),
                            row.get("status"),
                            row.get("details"),
                        ),
                    )
        except Exception:
            pass

    # Corrections
    if _table_empty(conn, "corrections") and os.path.exists(_CORRECTIONS_FILE):
        try:
            with open(_CORRECTIONS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            for item in data:
                conn.execute(
                    "INSERT OR REPLACE INTO corrections (id, faculty_name, date, period, reason, requester, status, reviewer, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                    (
                        item.get("id"),
                        item.get("faculty_name"),
                        item.get("date"),
                        item.get("period"),
                        item.get("reason"),
                        item.get("requester", "unknown"),
                        item.get("status", "pending"),
                        item.get("reviewer"),
                        item.get("notes"),
                        item.get("created_at"),
                        item.get("updated_at"),
                    ),
                )
        except Exception:
            pass


def _to_float(value: Optional[str]) -> Optional[float]:
    try:
        if value is None or value == "":
            return None
        return float(value)
    except Exception:
        return None


# --- Query helpers ---

def get_config() -> Dict:
    conn = _connect()
    try:
        row = conn.execute("SELECT * FROM config WHERE id=1").fetchone()
        if not row:
            return {}
        return dict(row)
    finally:
        conn.close()


def save_config(config: Dict) -> bool:
    conn = _connect()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO config (id, detection_time, threshold, sender_email, sender_password, email_receiver, notification_mode) VALUES (1,?,?,?,?,?,?)",
            (
                config.get("detection_time", 30),
                config.get("threshold", 0.6),
                config.get("sender_email", ""),
                config.get("sender_password", ""),
                config.get("email_receiver", ""),
                config.get("notification_mode", "Absent Only"),
            ),
        )
        conn.commit()
        return True
    except Exception:
        return False
    finally:
        conn.close()


def get_schedule() -> List[Dict]:
    conn = _connect()
    try:
        rows = conn.execute("SELECT period, start, end, faculty, subject FROM schedule ORDER BY period ASC").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def save_schedule(items: List[Dict]) -> bool:
    conn = _connect()
    try:
        conn.execute("DELETE FROM schedule")
        for item in items:
            conn.execute(
                "INSERT INTO schedule (period, start, end, faculty, subject) VALUES (?,?,?,?,?)",
                (
                    int(item.get("period", 0)),
                    item.get("start"),
                    item.get("end"),
                    item.get("faculty"),
                    item.get("subject"),
                ),
            )
        conn.commit()
        return True
    except Exception:
        return False
    finally:
        conn.close()


def add_attendance_log(entry: Dict) -> bool:
    conn = _connect()
    try:
        conn.execute(
            "INSERT INTO attendance_logs (timestamp, status, name, confidence, period, mode) VALUES (?,?,?,?,?,?)",
            (
                entry.get("timestamp"),
                entry.get("status"),
                entry.get("name"),
                entry.get("confidence"),
                entry.get("period"),
                entry.get("mode"),
            ),
        )
        conn.commit()
        return True
    except Exception:
        return False
    finally:
        conn.close()


def list_attendance_logs(limit: Optional[int] = None) -> List[Dict]:
    conn = _connect()
    try:
        if limit:
            rows = conn.execute(
                "SELECT timestamp, status, name, confidence, period, mode FROM attendance_logs ORDER BY id DESC LIMIT ?",
                (limit,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT timestamp, status, name, confidence, period, mode FROM attendance_logs ORDER BY id DESC"
            ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def clear_attendance_logs() -> bool:
    conn = _connect()
    try:
        conn.execute("DELETE FROM attendance_logs")
        conn.commit()
        return True
    except Exception:
        return False
    finally:
        conn.close()


def add_audit_log(entry: Dict) -> bool:
    conn = _connect()
    try:
        conn.execute(
            "INSERT INTO audit_logs (timestamp, actor, action, status, details) VALUES (?,?,?,?,?)",
            (
                entry.get("timestamp"),
                entry.get("actor"),
                entry.get("action"),
                entry.get("status"),
                entry.get("details"),
            ),
        )
        conn.commit()
        return True
    except Exception:
        return False
    finally:
        conn.close()


def list_audit_logs(limit: Optional[int] = None) -> List[Dict]:
    conn = _connect()
    try:
        if limit:
            rows = conn.execute(
                "SELECT timestamp, actor, action, status, details FROM audit_logs ORDER BY id DESC LIMIT ?",
                (limit,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT timestamp, actor, action, status, details FROM audit_logs ORDER BY id DESC"
            ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def list_corrections(status: Optional[str] = None) -> List[Dict]:
    conn = _connect()
    try:
        if status:
            rows = conn.execute(
                "SELECT * FROM corrections WHERE status=? ORDER BY created_at DESC",
                (status,),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM corrections ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def save_correction(item: Dict) -> bool:
    conn = _connect()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO corrections (id, faculty_name, date, period, reason, requester, status, reviewer, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (
                item.get("id"),
                item.get("faculty_name"),
                item.get("date"),
                item.get("period"),
                item.get("reason"),
                item.get("requester"),
                item.get("status"),
                item.get("reviewer"),
                item.get("notes"),
                item.get("created_at"),
                item.get("updated_at"),
            ),
        )
        conn.commit()
        return True
    except Exception:
        return False
    finally:
        conn.close()

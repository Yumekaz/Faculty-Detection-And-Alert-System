const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function exportAttendanceUrl() {
  return `${API_BASE}/export/attendance-logs`;
}

export function exportScheduleUrl() {
  return `${API_BASE}/export/schedule`;
}

export function exportConfigUrl() {
  return `${API_BASE}/export/config`;
}

export function exportBackupUrl() {
  return `${API_BASE}/export/backup`;
}

/**
 * Attendance API Client
 * Handles attendance checks and log management
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Types ---

export interface AttendanceLog {
    timestamp: string;
    status: "Present" | "Absent" | "Error";
    name: string | null;
    confidence: number | string | null;
    period: string | null;
    mode: "manual" | "auto";
}

export interface ManualCheckResponse {
    matched: boolean;
    name: string | null;
    confidence: number;
}

export interface AutoAttendanceResponse {
    status: string;
    message: string;
}

export interface LogsResponse {
    logs: AttendanceLog[];
}

export interface ClearLogsResponse {
    status: string;
    message: string;
}

// --- API Functions ---

/**
 * Trigger a manual attendance check
 * @param targetFaculty - Optional: specific faculty member to check for
 */
export async function manualAttendanceCheck(
    targetFaculty?: string
): Promise<ManualCheckResponse> {
    const response = await fetch(`${API_BASE}/attendance/attendance/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            target_faculty: targetFaculty || null,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Manual attendance check failed");
    }

    return response.json();
}

/**
 * Start the automated attendance loop
 * Runs in background according to schedule
 */
export async function startAutoAttendance(): Promise<AutoAttendanceResponse> {
    const response = await fetch(`${API_BASE}/attendance/attendance/auto/start`, {
        method: "POST",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to start auto attendance");
    }

    return response.json();
}

/**
 * Stop the automated attendance loop
 */
export async function stopAutoAttendance(): Promise<AutoAttendanceResponse> {
    const response = await fetch(`${API_BASE}/attendance/attendance/auto/stop`, {
        method: "POST",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to stop auto attendance");
    }

    return response.json();
}

/**
 * Get all attendance logs
 * @returns Array of attendance log records sorted by timestamp
 */
export async function getAttendanceLogs(): Promise<AttendanceLog[]> {
    const response = await fetch(`${API_BASE}/attendance/attendance/logs`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch logs");
    }

    const data: LogsResponse = await response.json();
    return data.logs;
}

/**
 * Clear all attendance logs
 * WARNING: This deletes all historical attendance data
 */
export async function clearAttendanceLogs(): Promise<ClearLogsResponse> {
    const response = await fetch(`${API_BASE}/attendance/attendance/logs/clear`, {
        method: "POST",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to clear logs");
    }

    return response.json();
}

// --- Utility Functions ---

/**
 * Get attendance stats from logs
 */
export function calculateStats(logs: AttendanceLog[]) {
    return {
        total: logs.length,
        present: logs.filter((l) => l.status === "Present").length,
        absent: logs.filter((l) => l.status === "Absent").length,
        error: logs.filter((l) => l.status === "Error").length,
        manual: logs.filter((l) => l.mode === "manual").length,
        auto: logs.filter((l) => l.mode === "auto").length,
    };
}

/**
 * Filter logs by date range
 */
export function filterLogsByDate(
    logs: AttendanceLog[],
    fromDate?: string,
    toDate?: string
): AttendanceLog[] {
    return logs.filter((log) => {
        const logDate = new Date(log.timestamp);

        if (fromDate && logDate < new Date(fromDate)) {
            return false;
        }

        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            if (logDate > to) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Schedule API Client
 * Handles class schedule and period management
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Types ---

export interface SchedulePeriod {
    period: number;
    start: string;
    end: string;
    faculty: string;
    subject?: string;
}

export interface CurrentPeriodResponse {
    period: SchedulePeriod | null;
}

export interface ScheduleResponse {
    schedule: SchedulePeriod[];
}

export interface UpdateScheduleResponse {
    status: string;
    message: string;
}

// --- API Functions ---

/**
 * Get the current active period based on day and time
 * @returns Current period info or null if no class is scheduled
 */
export async function getCurrentPeriod(): Promise<SchedulePeriod | null> {
    const response = await fetch(`${API_BASE}/attendance/schedule/current`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to get current period");
    }

    const data: CurrentPeriodResponse = await response.json();
    return data.period;
}

/**
 * Get the next upcoming period
 * @returns Next period info or null if no more classes today
 */
export async function getNextPeriod(): Promise<SchedulePeriod | null> {
    const response = await fetch(`${API_BASE}/attendance/schedule/next`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to get next period");
    }

    const data: CurrentPeriodResponse = await response.json();
    return data.period;
}

/**
 * Get the full weekly schedule
 */
export async function getFullSchedule(): Promise<SchedulePeriod[]> {
    const response = await fetch(`${API_BASE}/attendance/schedule/all`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to get schedule");
    }

    const data: ScheduleResponse = await response.json();
    return data.schedule;
}

/**
 * Update the schedule with new periods
 * @param schedule - Array of schedule periods
 */
export async function updateSchedule(
    schedule: SchedulePeriod[]
): Promise<UpdateScheduleResponse> {
    const response = await fetch(`${API_BASE}/attendance/schedule/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to update schedule");
    }

    return response.json();
}

// --- Utility Functions ---

/**
 * Days of the week for schedule display
 */
export const WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
] as const;

/**
 * Get today's day name
 */
export function getTodayName(): string {
    return WEEKDAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
}

/**
 * Sort schedule by period number
 */
export function sortScheduleByPeriod(schedule: SchedulePeriod[]): SchedulePeriod[] {
    return [...schedule].sort((a, b) => a.period - b.period);
}

/**
 * Format time for display (24h to 12h)
 */
export function formatTime(time24: string): string {
    const [hours, minutes] = time24.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}

/**
 * Check if a period is currently active
 */
export function isPeriodActive(period: SchedulePeriod): boolean {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    return currentTime >= period.start && currentTime < period.end;
}

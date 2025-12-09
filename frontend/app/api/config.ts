/**
 * Config API Client
 * Handles system configuration management
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Types ---

export interface SystemConfig {
    detection_time: number;
    threshold: number;
    sender_email: string;
    sender_password: string;
    email_receiver: string;
    notification_mode: string;
}

export type PartialConfig = Partial<SystemConfig>;

export interface ConfigResponse extends SystemConfig { }

export interface UpdateConfigResponse {
    status: string;
    message: string;
    config: SystemConfig;
}

// --- Default Values ---

export const DEFAULT_CONFIG: SystemConfig = {
    detection_time: 30,
    threshold: 0.6,
    sender_email: "",
    sender_password: "",
    email_receiver: "",
    notification_mode: "Absent Only",
};

export const NOTIFICATION_MODES = [
    { value: "None", label: "None (No notifications)" },
    { value: "Absent Only", label: "Absent Only" },
    { value: "All (Present & Absent)", label: "All (Present & Absent)" },
] as const;

// --- API Functions ---

/**
 * Get the current system configuration
 */
export async function getConfig(): Promise<SystemConfig> {
    const response = await fetch(`${API_BASE}/config/config`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to load configuration");
    }

    return response.json();
}

/**
 * Update the full configuration (replaces all fields)
 * @param config - Complete configuration object
 */
export async function updateConfig(config: SystemConfig): Promise<UpdateConfigResponse> {
    const response = await fetch(`${API_BASE}/config/config/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to update configuration");
    }

    return response.json();
}

/**
 * Partially update configuration (only provided fields)
 * @param updates - Partial configuration object with fields to update
 */
export async function patchConfig(updates: PartialConfig): Promise<UpdateConfigResponse> {
    const response = await fetch(`${API_BASE}/config/config/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to update configuration");
    }

    return response.json();
}

/**
 * Reset configuration to system defaults
 */
export async function resetConfig(): Promise<UpdateConfigResponse> {
    const response = await fetch(`${API_BASE}/config/config/reset`, {
        method: "POST",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to reset configuration");
    }

    return response.json();
}

// --- Validation Utilities ---

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate configuration values
 */
export function validateConfig(config: SystemConfig): string[] {
    const errors: string[] = [];

    if (config.detection_time < 1 || config.detection_time > 60) {
        errors.push("Detection time must be between 1 and 60 seconds");
    }

    if (config.threshold < 0.1 || config.threshold > 1.0) {
        errors.push("Threshold must be between 0.1 and 1.0");
    }

    // Email validation is needed if notification mode is not "None"
    if (config.notification_mode !== "None") {
        if (!config.sender_email || !isValidEmail(config.sender_email)) {
            errors.push("Valid sender email is required for notifications");
        }
        if (!config.sender_password) {
            errors.push("Sender password is required for notifications");
        }
        if (!config.email_receiver || !isValidEmail(config.email_receiver)) {
            errors.push("Valid receiver email is required for notifications");
        }
    }

    return errors;
}

/**
 * Format threshold as percentage
 */
export function formatThreshold(value: number): string {
    return `${(value * 100).toFixed(0)}%`;
}

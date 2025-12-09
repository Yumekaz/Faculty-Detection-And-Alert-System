/**
 * Recognition API Client
 * Handles faculty management and face recognition/search
 */

import { fileToBase64 } from "./inference";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Types ---

export interface Faculty {
    name: string;
}

export interface FacultyListResponse {
    faculty: string[];
}

export interface AddFacultyResponse {
    status: string;
    message: string;
}

export interface DeleteFacultyResponse {
    status: string;
    message: string;
}

export interface SearchFacultyResponse {
    matched: boolean;
    name: string | null;
    confidence: number;
}

export interface ClearDatabaseResponse {
    status: string;
    message: string;
    errors: string[];
}

// --- API Functions ---

/**
 * Get list of all registered faculty members
 */
export async function listFaculty(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/recognition/faculty/list`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to list faculty");
    }

    const data: FacultyListResponse = await response.json();
    return data.faculty;
}

/**
 * Add a new faculty member with their photo
 * @param name - Faculty member's name
 * @param image - Photo as File, Blob, or base64 string
 */
export async function addFaculty(
    name: string,
    image: File | Blob | string
): Promise<AddFacultyResponse> {
    let imageBase64: string;

    if (typeof image === "string") {
        imageBase64 = image;
    } else {
        imageBase64 = await fileToBase64(image);
    }

    const response = await fetch(`${API_BASE}/recognition/faculty/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name.trim(),
            image_base64: imageBase64,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to add faculty");
    }

    return response.json();
}

/**
 * Delete a faculty member by name
 * @param name - Faculty member's name (case-insensitive)
 */
export async function deleteFaculty(name: string): Promise<DeleteFacultyResponse> {
    const response = await fetch(`${API_BASE}/recognition/faculty/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to delete faculty");
    }

    return response.json();
}

/**
 * Search for a matching faculty member using an embedding
 * @param embedding - 512-dimensional face embedding vector
 */
export async function searchFaculty(embedding: number[]): Promise<SearchFacultyResponse> {
    const response = await fetch(`${API_BASE}/recognition/faculty/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embedding }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to search faculty");
    }

    return response.json();
}

/**
 * Verify a specific faculty member using an embedding
 * @param embedding - 512-dimensional face embedding vector
 * @param targetName - Name of faculty to verify against
 */
export async function searchFacultySpecific(
    embedding: number[],
    targetName: string
): Promise<SearchFacultyResponse> {
    const response = await fetch(`${API_BASE}/recognition/faculty/search-specific`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            embedding,
            target_name: targetName,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to verify faculty");
    }

    return response.json();
}

/**
 * Clear the entire faculty database
 * WARNING: This deletes all registered faculty members
 */
export async function clearFacultyDatabase(): Promise<ClearDatabaseResponse> {
    const response = await fetch(`${API_BASE}/recognition/faculty/clear-db`, {
        method: "POST",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to clear database");
    }

    return response.json();
}

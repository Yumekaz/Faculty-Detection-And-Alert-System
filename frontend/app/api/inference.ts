/**
 * Inference API Client
 * Handles communication with the backend inference service for face detection and embeddings
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Types ---

export interface DetectedFace {
    bbox: [number, number, number, number]; // [x1, y1, x2, y2]
    confidence: number;
}

export interface DetectFacesResponse {
    faces: DetectedFace[];
}

export interface ExtractEmbeddingResponse {
    embedding: number[] | null;
    message?: string;
}

export interface InitModelsResponse {
    status: string;
    message: string;
}

// --- Helper Functions ---

/**
 * Convert a File or Blob to base64 string
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/png;base64,")
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// --- API Functions ---

/**
 * Initialize ML models on the backend
 * Must be called before using detect-faces or extract-embedding
 */
export async function initModels(): Promise<InitModelsResponse> {
    const response = await fetch(`${API_BASE}/inference/init-models`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to initialize models");
    }

    return response.json();
}

/**
 * Detect faces in an image
 * @param image - Image file or base64 string
 * @returns Array of detected faces with bounding boxes and confidence scores
 */
export async function detectFaces(
    image: File | Blob | string
): Promise<DetectFacesResponse> {
    let body: string;
    let headers: HeadersInit;

    if (typeof image === "string") {
        body = JSON.stringify({ image_base64: image });
        headers = { "Content-Type": "application/json" };
    } else {
        const base64 = await fileToBase64(image);
        body = JSON.stringify({ image_base64: base64 });
        headers = { "Content-Type": "application/json" };
    }

    const response = await fetch(`${API_BASE}/inference/detect-faces`, {
        method: "POST",
        headers,
        body,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to detect faces");
    }

    return response.json();
}

/**
 * Extract face embedding for a specific bounding box region
 * @param image - Image file or base64 string
 * @param bbox - Bounding box coordinates [x1, y1, x2, y2]
 * @returns Embedding vector (512-dimensional) or null if face not found
 */
export async function extractEmbedding(
    image: File | Blob | string,
    bbox: [number, number, number, number]
): Promise<ExtractEmbeddingResponse> {
    let imageBase64: string;

    if (typeof image === "string") {
        imageBase64 = image;
    } else {
        imageBase64 = await fileToBase64(image);
    }

    const body = JSON.stringify({
        image_base64: imageBase64,
        bbox: bbox,
    });

    const response = await fetch(`${API_BASE}/inference/extract-embedding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to extract embedding");
    }

    return response.json();
}

/**
 * Detect faces and extract embeddings for all detected faces in one go
 * @param image - Image file or base64 string
 * @returns Array of objects containing face bbox, confidence, and embedding
 */
export async function detectAndExtractAll(
    image: File | Blob | string
): Promise<
    Array<{
        bbox: [number, number, number, number];
        confidence: number;
        embedding: number[] | null;
    }>
> {
    let imageBase64: string;
    if (typeof image === "string") {
        imageBase64 = image;
    } else {
        imageBase64 = await fileToBase64(image);
    }

    const { faces } = await detectFaces(imageBase64);

    const results = await Promise.all(
        faces.map(async (face) => {
            const { embedding } = await extractEmbedding(
                imageBase64,
                face.bbox as [number, number, number, number]
            );
            return {
                bbox: face.bbox as [number, number, number, number],
                confidence: face.confidence,
                embedding,
            };
        })
    );

    return results;
}

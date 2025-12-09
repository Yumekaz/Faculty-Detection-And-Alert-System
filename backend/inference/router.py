import cv2
import numpy as np
import base64
from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from pydantic import BaseModel
from typing import List, Optional, Any

from . import model_loader
from . import face_detect
from . import embeddings

router = APIRouter()

# Global Model Store
MODELS = {
    "yolo": None,
    "insightface": None
}

# --- Pydantic Models for Input ---
class ImagePayload(BaseModel):
    image_base64: str

class EmbeddingPayload(BaseModel):
    image_base64: str
    bbox: List[int]

# --- Helper Functions ---
def decode_image(image_bytes: bytes) -> np.ndarray:
    """Converts raw bytes to OpenCV image format"""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image data")
    return img

def parse_image_input(file: Optional[UploadFile], payload: Optional[ImagePayload]) -> np.ndarray:
    """Handles both File upload and Base64 JSON input"""
    if file:
        return decode_image(file.file.read())
    elif payload and payload.image_base64:
        try:
            image_bytes = base64.b64decode(payload.image_base64)
            return decode_image(image_bytes)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 string")
    else:
        raise HTTPException(status_code=400, detail="No image provided. Send file or base64.")

def ensure_models_loaded():
    if MODELS["yolo"] is None or MODELS["insightface"] is None:
        raise HTTPException(status_code=503, detail="Models not initialized. Call /init-models first.")

# --- Endpoints ---

@router.post("/init-models")
async def init_models():
    """Initialize models globally"""
    yolo, app = model_loader.load_models()
    if yolo is None or app is None:
        raise HTTPException(status_code=500, detail="Failed to load models")
    
    MODELS["yolo"] = yolo
    MODELS["insightface"] = app
    return {"status": "success", "message": "Models loaded successfully"}

@router.post("/detect-faces")
async def detect_faces(
    file: Optional[UploadFile] = File(None),
    payload: Optional[ImagePayload] = Body(None)
):
    """Detect faces in an image"""
    ensure_models_loaded()
    image = parse_image_input(file, payload)
    
    faces = face_detect.detect_faces_yolo(MODELS["yolo"], image)
    
    # Convert numpy types to python native types for JSON serialization
    serializable_faces = []
    for face in faces:
        serializable_faces.append({
            "bbox": [int(c) for c in face['bbox']],
            "confidence": float(face['confidence'])
        })
        
    return {"faces": serializable_faces}

@router.post("/extract-embedding")
async def extract_embedding(
    file: Optional[UploadFile] = File(None),
    bbox: Optional[str] = Body(None), # If using form-data, bbox comes as string
    payload: Optional[EmbeddingPayload] = Body(None)
):
    """Extract embedding for a specific face bbox"""
    ensure_models_loaded()
    
    # 1. Parse Image
    if payload:
        image = parse_image_input(None, payload)
        target_bbox = payload.bbox
    elif file:
        image = parse_image_input(file, None)
        # Parse bbox from form string "[x1, y1, x2, y2]"
        try:
            import json
            target_bbox = json.loads(bbox)
        except (json.JSONDecodeError, TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Invalid bbox format. Expected JSON array.")
    else:
        raise HTTPException(status_code=400, detail="No input provided")

    # 2. Extract Embedding
    embedding = embeddings.get_face_embedding(MODELS["insightface"], image, target_bbox)
    
    if embedding is None:
        return {"embedding": None, "message": "Face too small or not detected in crop"}
        
    return {"embedding": embedding.tolist()}
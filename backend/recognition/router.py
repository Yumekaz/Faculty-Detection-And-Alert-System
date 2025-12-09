import os
import shutil
import base64
import uuid
from typing import List, Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from pydantic import BaseModel

from . import faiss_store
from . import faculty_manager
# Import global models from the inference module to pass to faculty_manager
from ..inference.router import MODELS, ensure_models_loaded

router = APIRouter()

# --- Pydantic Models ---

class AddFacultyPayload(BaseModel):
    image_base64: str
    name: str

class DeleteFacultyPayload(BaseModel):
    name: str

class SearchPayload(BaseModel):
    embedding: List[float]

class SpecificSearchPayload(BaseModel):
    embedding: List[float]
    target_name: str

# --- Helper Functions ---

def save_temp_image(file: Optional[UploadFile], base64_str: Optional[str]) -> str:
    """
    Saves uploaded image to the faculty_db folder to satisfy add_faculty_member logic.
    Returns the filename and full path.
    """
    filename = f"{uuid.uuid4().hex}.jpg"
    file_path = os.path.join(faiss_store.IMAGES_DIR, filename)

    try:
        if file:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        elif base64_str:
            img_data = base64.b64decode(base64_str)
            with open(file_path, "wb") as buffer:
                buffer.write(img_data)
        else:
            raise ValueError("No image provided")
        return filename, file_path
    except (IOError, OSError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")

# --- Endpoints ---

@router.post("/faculty/add")
async def add_faculty(
    file: Optional[UploadFile] = File(None),
    name: Optional[str] = Form(None),
    payload: Optional[AddFacultyPayload] = Body(None)
):
    """
    Add a new faculty member.
    Requires Models to be initialized in the inference module.
    """
    ensure_models_loaded()
    
    # Handle inputs (Multipart or JSON)
    final_name = name
    image_base64 = None

    if payload:
        final_name = payload.name
        image_base64 = payload.image_base64
    
    if not final_name:
        raise HTTPException(status_code=400, detail="Name is required")

    # Save file to disk (Required by faculty_manager.add_faculty_member logic)
    try:
        filename, file_path = save_temp_image(file, image_base64)
    except ValueError:
        raise HTTPException(status_code=400, detail="Image (file or base64) is required")

    # Call manager
    success, message = faculty_manager.add_faculty_member(
        MODELS["yolo"],
        MODELS["insightface"],
        file_path,
        final_name,
        filename
    )

    if not success:
        # Clean up file if addition failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=message)

    return {"status": "success", "message": message}

@router.post("/faculty/delete")
async def delete_faculty(payload: DeleteFacultyPayload):
    """Delete a faculty member by name (case-insensitive)"""
    # Load current names to find exact case match
    faculty_data, _ = faiss_store.load_faculty_database()
    existing_names = faculty_data.get('names', [])
    
    target_name = None
    for name in existing_names:
        if name.lower() == payload.name.lower():
            target_name = name
            break
            
    if not target_name:
         raise HTTPException(status_code=404, detail=f"Faculty member '{payload.name}' not found.")

    success, message = faculty_manager.delete_faculty_member(target_name)
    
    if not success:
        # Check if it was "not found" (404) or "error" (500)
        if "not found" in message.lower():
            raise HTTPException(status_code=404, detail=message)
        raise HTTPException(status_code=500, detail=message)
    
    return {"status": "success", "message": message}

@router.post("/faculty/search")
async def search_faculty(payload: SearchPayload):
    """Identify faculty from embedding"""
    faculty_data, index = faiss_store.load_faculty_database()
    
    match, name, confidence = faculty_manager.search_faculty(
        index, 
        faculty_data['names'], 
        payload.embedding
    )
    
    return {
        "matched": match,
        "name": name,
        "confidence": confidence
    }

@router.post("/faculty/search-specific")
async def search_specific(payload: SpecificSearchPayload):
    """Verify specific faculty member"""
    faculty_data, index = faiss_store.load_faculty_database()
    
    match, name, confidence = faculty_manager.search_faculty_specific(
        index,
        faculty_data['names'],
        payload.embedding,
        payload.target_name
    )
    
    return {
        "matched": match,
        "name": name,
        "confidence": confidence
    }

@router.post("/faculty/clear-db")
async def clear_database():
    """Clear the entire faculty database"""
    success, message, errors = faiss_store.clear_faculty_database()
    
    if not success:
        raise HTTPException(status_code=500, detail=message)
        
    return {
        "status": "success",
        "message": message,
        "errors": errors
    }

@router.get("/faculty/list")
async def list_faculty():
    """List all registered faculty names"""
    faculty_data, _ = faiss_store.load_faculty_database()
    return {"faculty": faculty_data.get("names", [])}
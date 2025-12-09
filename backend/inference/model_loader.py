import os
import requests
from ultralytics import YOLO
import insightface

# --- MODEL CONFIG ---
MODEL_PATH_FACE = "yolov8n-face-lindevs.pt"
MODEL_PATH_GENERAL = "yolov8n.pt"
FACE_MODEL_URL = "https://github.com/lindevs/yolov8-face/releases/download/v1.0/yolov8n-face-lindevs.pt"
GENERAL_MODEL_URL = "https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt"

# --- MODEL DOWNLOADING ---
def download_yolo_model():
    """Download YOLOv8 model (face-specific if available, else general)"""
    if os.path.exists(MODEL_PATH_FACE):
        return MODEL_PATH_FACE
    if os.path.exists(MODEL_PATH_GENERAL):
        return MODEL_PATH_GENERAL
    
    try:
        # TODO: Replace st.info with logging
        # st.info("📥 Downloading YOLOv8n-face model (optimized for faces)...")
        r = requests.get(FACE_MODEL_URL, stream=True, timeout=60)
        r.raise_for_status()
        with open(MODEL_PATH_FACE, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        # st.success("✅ YOLOv8n-face model downloaded.")
        return MODEL_PATH_FACE
    except Exception as e:
        # st.warning(f"❌ Face model download failed: {e}. Falling back to general model.")
        
        try:
            # st.info("📥 Downloading YOLOv8n general model...")
            r = requests.get(GENERAL_MODEL_URL, stream=True, timeout=60)
            r.raise_for_status()
            with open(MODEL_PATH_GENERAL, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            # st.success("✅ YOLOv8n general model downloaded.")
            return MODEL_PATH_GENERAL
        except Exception as e2:
            # st.error(f"❌ General model download also failed: {e2}")
            return None

# --- MODELS INITIALIZATION ---
# Removed @st.cache_resource
def load_models():
    """Load YOLOv8 face detector and InsightFace ArcFace model"""
    try:
        model_path = download_yolo_model()
        if model_path is None:
            # st.error("Failed to download any YOLOv8 model")
            return None, None
            
        yolo_model = YOLO(model_path)
        
        # UI Feedback logic removed
        # if model_path == MODEL_PATH_FACE:
        #     st.sidebar.info("🎯 Using YOLOv8n-face model")
        # else:
        #     st.sidebar.warning("⚠ Using YOLOv8n general model")
        
        app = insightface.app.FaceAnalysis(providers=['CPUExecutionProvider'])
        app.prepare(ctx_id=0, det_size=(640, 640))
        
        # st.sidebar.success("✅ AI Models Loaded")
        return yolo_model, app
    except Exception as e:
        # st.sidebar.error(f"Failed to load models: {e}")
        # st.info("Make sure you have installed: ultralytics, insightface, onnxruntime, requests")
        return None, None
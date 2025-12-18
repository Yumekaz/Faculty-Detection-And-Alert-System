import os
import requests
from ultralytics import YOLO
import insightface

# --- MODEL CONFIG ---
# Path relative to the backend directory (inference/../models/)
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH_FACE = os.path.join(_BACKEND_DIR, "models", "yolov8s.pt")
MODEL_PATH_GENERAL = os.path.join(_BACKEND_DIR, "models", "yolov8n.pt")
FACE_MODEL_URL = "https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8s.pt"
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
def load_models():
    """Load YOLOv8 face detector and InsightFace ArcFace model"""
    yolo_model = None
    insightface_app = None
    
    try:
        # 1. Load YOLO model
        model_path = download_yolo_model()
        if model_path is None:
            print("ERROR: Failed to download any YOLOv8 model")
            return None, None
            
        yolo_model = YOLO(model_path)
        print(f"✅ YOLO model loaded from: {model_path}")
        
        # 2. Try to load InsightFace
        models_dir = os.path.join(_BACKEND_DIR, "models")
        
        # Try InsightFace 0.7.x API first (with providers), then fall back to 0.2.1 API
        def try_load_insightface(model_name):
            """Try loading InsightFace with different API versions"""
            try:
                # InsightFace 0.7.x API - supports providers in constructor
                app = insightface.app.FaceAnalysis(
                    name=model_name, 
                    root=models_dir,
                    providers=['CPUExecutionProvider']
                )
                app.prepare(ctx_id=0, det_size=(640, 640))
                return app
            except TypeError:
                # InsightFace 0.2.1 API - no providers parameter
                app = insightface.app.FaceAnalysis(name=model_name, root=models_dir)
                app.prepare(ctx_id=0, det_size=(640, 640))
                return app
        
        try:
            insightface_app = try_load_insightface('buffalo_l')
            print("✅ InsightFace model (buffalo_l) loaded successfully")
        except Exception as e1:
            print(f"⚠️ InsightFace buffalo_l failed: {e1}")
            try:
                insightface_app = try_load_insightface('antelopev2')
                print("✅ InsightFace model (antelopev2) loaded successfully")
            except Exception as e2:
                print(f"⚠️ InsightFace antelopev2 also failed: {e2}")
                print("⚠️ InsightFace models will be auto-downloaded on first use (requires internet).")
                print(f"   Models are stored in: {models_dir}")
                print("⚠️ If auto-download fails, manually download from: https://github.com/deepinsight/insightface/releases")
                insightface_app = None
        
        return yolo_model, insightface_app
        
    except Exception as e:
        print(f"ERROR loading models: {e}")
        import traceback
        traceback.print_exc()
        return yolo_model, insightface_app
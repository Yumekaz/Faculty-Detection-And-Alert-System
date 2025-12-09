import os
import pickle
import faiss
import numpy as np
import glob

# --- FILE/DIR CONFIG ---
IMAGES_DIR = "faculty_db"
EMBEDDINGS_FILE = "faculty_embeddings.pkl"
FAISS_INDEX_FILE = "faculty_faiss.index"

# Ensure folders exist
os.makedirs(IMAGES_DIR, exist_ok=True)

# --- FAISS INDEX MANAGEMENT ---
def load_faculty_database():
    """Load faculty embeddings and FAISS index"""
    try:
        if os.path.exists(EMBEDDINGS_FILE) and os.path.exists(FAISS_INDEX_FILE):
            with open(EMBEDDINGS_FILE, 'rb') as f:
                faculty_data = pickle.load(f)
            index = faiss.read_index(FAISS_INDEX_FILE)
            return faculty_data, index
    except (IOError, OSError, pickle.UnpicklingError, RuntimeError) as e:
        print(f"Warning: Failed to load faculty database: {e}")

    return {'names': [], 'embeddings': [], 'image_files': []}, None

def save_faculty_database(faculty_data, index):
    """Save faculty embeddings and FAISS index"""
    try:
        with open(EMBEDDINGS_FILE, 'wb') as f:
            pickle.dump(faculty_data, f)
        if index is not None:
            faiss.write_index(index, FAISS_INDEX_FILE)

        return True
    except (IOError, OSError, pickle.PicklingError, RuntimeError) as e:
        print(f"Error: Failed to save faculty database: {e}")
        return False

def build_faiss_index(embeddings):
    """Build FAISS index from embeddings"""
    if len(embeddings) == 0:
        return None
    
    embeddings_array = np.array(embeddings).astype('float32')
    faiss.normalize_L2(embeddings_array)
    dimension = embeddings_array.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings_array)
    return index

def clear_faculty_database():
    """Clear all faculty data including images, embeddings, and FAISS index"""
    try:
        files_removed = 0
        errors = []
        
        image_files = glob.glob(os.path.join(IMAGES_DIR, "*"))
        for f in image_files:
            try:
                os.remove(f)
                files_removed += 1
            except Exception as e:
                errors.append(f"Failed to remove {f}: {str(e)}")
        
        for f in [EMBEDDINGS_FILE, FAISS_INDEX_FILE]:
            if os.path.exists(f):
                try:
                    os.remove(f)
                    files_removed += 1
                except Exception as e:
                    errors.append(f"Failed to remove {f}: {str(e)}")
        
        # st.cache_data.clear() # Clear data cache
        return True, f"Successfully cleared database! Removed {files_removed} files.", errors
        
    except Exception as e:
        return False, f"Failed to clear database: {str(e)}", []
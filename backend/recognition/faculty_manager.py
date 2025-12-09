import os
import cv2
import numpy as np
import faiss

# Import storage functions
from . import faiss_store
# Import inference logic from the sibling module
from ..inference.face_detect import detect_faces_yolo
from ..inference.embeddings import get_face_embedding

def add_faculty_member(yolo_model, insightface_app, image_path, name, image_filename):
    """Add a new faculty member to the database"""
    try:
        image = cv2.imread(image_path)
        if image is None:
            return False, "Could not load image"
        
        faces = detect_faces_yolo(yolo_model, image)
        if len(faces) == 0:
            return False, "No face detected"
        if len(faces) > 1:
            # st.warning(f"Multiple faces detected in {name}. Using the largest face.")
            pass
        
        best_face = max(faces, key=lambda x: x['confidence'])
        embedding = get_face_embedding(insightface_app, image, best_face['bbox'])
        if embedding is None:
            return False, "Failed to extract face embedding"
        
        faculty_data, index = faiss_store.load_faculty_database()
        
        if 'image_files' not in faculty_data:
            faculty_data['image_files'] = []
            
        faculty_data['names'].append(name)
        faculty_data['embeddings'].append(embedding.tolist())
        faculty_data['image_files'].append(image_filename)
        
        index = faiss_store.build_faiss_index(faculty_data['embeddings'])
        
        if faiss_store.save_faculty_database(faculty_data, index):
            return True, "Faculty member added successfully"
        else:
            return False, "Failed to save to database"
            
    except Exception as e:
        return False, f"Error: {str(e)}"

def delete_faculty_member(name_to_delete):
    """Deletes a faculty member from the database."""
    try:
        faculty_data, index = faiss_store.load_faculty_database()
        
        if name_to_delete not in faculty_data['names']:
            return False, "Faculty member not found."
            
        idx = faculty_data['names'].index(name_to_delete)
        
        # Remove data
        faculty_data['names'].pop(idx)
        faculty_data['embeddings'].pop(idx)
        image_file = faculty_data['image_files'].pop(idx)
        
        # Delete image file
        try:
            os.remove(os.path.join(faiss_store.IMAGES_DIR, image_file))
        except Exception as e:
            # st.warning(f"Could not delete image file {image_file}: {e}")
            pass
            
        # Rebuild index
        new_index = faiss_store.build_faiss_index(faculty_data['embeddings'])
        
        # Save updated database
        if faiss_store.save_faculty_database(faculty_data, new_index):
            return True, f"Successfully deleted {name_to_delete}."
        else:
            return False, "Failed to save updated database."
            
    except Exception as e:
        return False, f"Error deleting faculty: {str(e)}"

def search_faculty_specific(index, faculty_names, query_embedding, target_name, threshold=0.6):
    """Search for a specific faculty member using FAISS"""
    if index is None or len(faculty_names) == 0:
        return False, None, 0.0
    
    try:
        if target_name not in faculty_names:
            return False, None, 0.0
        
        target_index = faculty_names.index(target_name)
        query_embedding = np.array([query_embedding]).astype('float32')
        faiss.normalize_L2(query_embedding)
        
        distances, indices = index.search(query_embedding, min(5, len(faculty_names)))
        
        for i, idx in enumerate(indices[0]):
            if idx == target_index:
                distance = distances[0][i]
                similarity = 1.0 - (distance / 2.0)
                if similarity >= threshold:
                    return True, target_name, float(similarity)
                break
        return False, None, 0.0
        
    except Exception as e:
        # st.error(f"Search failed: {e}")
        return False, None, 0.0

def search_faculty(index, faculty_names, query_embedding, threshold=0.6):
    """Search for matching faculty member using FAISS"""
    if index is None or len(faculty_names) == 0:
        return False, None, 0.0
    
    try:
        query_embedding = np.array([query_embedding]).astype('float32')
        faiss.normalize_L2(query_embedding)
        distances, indices = index.search(query_embedding, 1)
        
        if len(distances[0]) > 0:
            distance = distances[0][0]
            idx = indices[0][0]
            similarity = 1.0 - (distance / 2.0)
            
            if similarity >= threshold:
                name = faculty_names[idx]
                return True, name, float(similarity)
        
        return False, None, 0.0
        
    except Exception as e:
        # st.error(f"Search failed: {e}")
        return False, None, 0.0
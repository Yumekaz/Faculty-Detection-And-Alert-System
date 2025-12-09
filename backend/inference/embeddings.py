import cv2

# --- FACE ENCODING ---
def get_face_embedding(insightface_app, image, bbox, margin_ratio=0.3):
    """Extracts a face embedding from a bounding box."""
    h, w = image.shape[:2]
    x1, y1, x2, y2 = bbox
    margin = int(max(x2 - x1, y2 - y1) * margin_ratio)
    x1 = max(0, x1 - margin)
    y1 = max(0, y1 - margin)
    x2 = min(w, x2 + margin)
    y2 = min(h, y2 + margin)

    face_img = image[y1:y2, x1:x2]
    if face_img.shape[0] < 20 or face_img.shape[1] < 20:
        return None  # too small

    face_img = cv2.resize(face_img, (112, 112))
    face_rgb = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)

    faces = insightface_app.get(face_rgb)
    if len(faces) > 0:
        return faces[0].embedding
    return None
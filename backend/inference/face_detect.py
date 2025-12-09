# --- FACE DETECTION ---
def detect_faces_yolo(yolo_model, image):
    """Detect faces using YOLOv8 and return bounding boxes"""
    results = yolo_model(image, conf=0.5, verbose=False)
    faces = []
    
    if len(results) > 0 and len(results[0].boxes) > 0:
        boxes = results[0].boxes.xyxy.cpu().numpy()
        confidences = results[0].boxes.conf.cpu().numpy()
        
        for box, conf in zip(boxes, confidences):
            x1, y1, x2, y2 = box.astype(int)
            faces.append({'bbox': [x1, y1, x2, y2], 'confidence': float(conf)})
    
    return faces
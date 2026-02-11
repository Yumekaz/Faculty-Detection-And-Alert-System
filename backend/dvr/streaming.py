# DVR Streaming Service
import cv2
import numpy as np
from datetime import datetime
from typing import Dict, Optional, Tuple
import threading

from .config import load_config, get_rtsp_url_formats


class DVRStreamManager:
    """Manages RTSP camera connections and streaming"""
    
    def __init__(self):
        self.cameras: Dict[int, Optional[cv2.VideoCapture]] = {}
        self.config = load_config()
        self.lock = threading.Lock()
        self._running = False
    
    def reload_config(self):
        """Reload configuration from file"""
        self.config = load_config()
    
    def connect_camera(self, channel: int) -> bool:
        """Try to connect to a camera using different URL formats"""
        url_formats = get_rtsp_url_formats(self.config, channel)
        
        for rtsp_url in url_formats:
            try:
                cap = cv2.VideoCapture(rtsp_url)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                
                if cap.isOpened():
                    ret, frame = cap.read()
                    if ret and frame is not None:
                        with self.lock:
                            # Release existing connection if any
                            if channel in self.cameras and self.cameras[channel] is not None:
                                self.cameras[channel].release()
                            self.cameras[channel] = cap
                        return True
                    cap.release()
            except Exception:
                continue
        
        with self.lock:
            self.cameras[channel] = None
        return False
    
    def connect_all(self) -> Dict[int, bool]:
        """Connect to all configured cameras"""
        self._running = True
        results = {}
        for ch in range(1, self.config['num_cameras'] + 1):
            results[ch] = self.connect_camera(ch)
        return results
    
    def disconnect_all(self):
        """Disconnect all cameras"""
        self._running = False
        with self.lock:
            for ch in list(self.cameras.keys()):
                if self.cameras[ch] is not None:
                    self.cameras[ch].release()
            self.cameras.clear()
    
    def get_frame(self, channel: int) -> Tuple[bool, np.ndarray]:
        """Get a frame from a specific camera"""
        width = self.config['resolution']['width']
        height = self.config['resolution']['height']
        
        with self.lock:
            cap = self.cameras.get(channel)
        
        if cap is None or not cap.isOpened():
            # Return placeholder frame
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            cv2.putText(frame, f"Camera {channel} - NO FEED", (width//4, height//2),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            return False, frame
        
        ret, frame = cap.read()
        if not ret or frame is None:
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            cv2.putText(frame, f"Camera {channel} - LOST", (width//4, height//2),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            return False, frame
        
        # Resize frame
        frame = cv2.resize(frame, (width, height))
        
        # Add camera label
        cv2.putText(frame, f"Camera {channel}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Add timestamp
        timestamp = datetime.now().strftime('%H:%M:%S')
        cv2.putText(frame, timestamp, (width - 100, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        return True, frame
    
    def get_status(self) -> Dict[int, bool]:
        """Get connection status for all cameras"""
        status = {}
        with self.lock:
            for ch in range(1, self.config['num_cameras'] + 1):
                cap = self.cameras.get(ch)
                status[ch] = cap is not None and cap.isOpened()
        return status
    
    def is_running(self) -> bool:
        """Check if streaming is active"""
        return self._running
    
    def generate_mjpeg(self, channel: int):
        """Generator for MJPEG streaming"""
        while self._running:
            success, frame = self.get_frame(channel)
            
            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if not ret:
                continue
            
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    
    def capture_snapshot(self) -> Optional[bytes]:
        """Capture a combined snapshot of all cameras"""
        frames = []
        for ch in range(1, self.config['num_cameras'] + 1):
            _, frame = self.get_frame(ch)
            frames.append(frame)
        
        if not frames:
            return None
        
        # Stack frames horizontally
        combined = np.hstack(frames)
        
        # Encode as JPEG
        ret, buffer = cv2.imencode('.jpg', combined, [cv2.IMWRITE_JPEG_QUALITY, 90])
        if not ret:
            return None
        
        return buffer.tobytes()


# Global instance
stream_manager = DVRStreamManager()

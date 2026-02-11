# DVR Configuration Management
import json
import os
from typing import Dict, Any

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "..", "dvr_config.json")

DEFAULT_CONFIG = {
    "ip": "192.168.1.68",
    "port": 554,
    "username": "admin",
    "password": "hik@4455",
    "num_cameras": 3,
    "resolution": {"width": 640, "height": 360}
}


def load_config() -> Dict[str, Any]:
    """Load DVR configuration from file or return defaults"""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return DEFAULT_CONFIG.copy()


def save_config(config: Dict[str, Any]) -> bool:
    """Save DVR configuration to file"""
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=2)
        return True
    except IOError:
        return False


def get_rtsp_url(config: Dict[str, Any], channel: int) -> str:
    """Generate RTSP URL for a specific channel"""
    return (
        f"rtsp://{config['username']}:{config['password']}@"
        f"{config['ip']}:{config['port']}/Streaming/Channels/{channel}01"
    )


def get_rtsp_url_formats(config: Dict[str, Any], channel: int) -> list:
    """Get list of possible RTSP URL formats for Hikvision DVR"""
    username = config['username']
    password = config['password']
    ip = config['ip']
    port = config['port']
    
    return [
        f"rtsp://{username}:{password}@{ip}:{port}/Streaming/Channels/{channel}01",
        f"rtsp://{username}:{password}@{ip}:{port}/Streaming/channels/{channel}01",
        f"rtsp://{username}:{password}@{ip}:{port}/h264/ch{channel}/main/av_stream",
    ]

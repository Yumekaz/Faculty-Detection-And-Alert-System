import os
import json

CONFIG_FILE = "system_config.json"
DEFAULT_RECEIVER = "example_receiver@mail.com"

# Default configuration dictionary
DEFAULT_CONFIG = {
    "detection_time": 30, 
    "threshold": 0.6,
    "sender_email": "",
    "sender_password": "",
    "email_receiver": DEFAULT_RECEIVER,
    "notification_mode": "Absent Only" # "All (Present & Absent)", "Absent Only", "None"
}

# --- CONFIG MANAGEMENT ---
def load_config():
    """Load system configuration"""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
    except (IOError, json.JSONDecodeError, OSError) as e:
        print(f"Warning: Could not load config file: {e}")

    # Return default config if file doesn't exist or error occurs
    return DEFAULT_CONFIG.copy()

def save_config(config):
    """Save system configuration"""
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
        return True
    except (IOError, OSError, TypeError) as e:
        print(f"Error saving config: {e}")
        return False
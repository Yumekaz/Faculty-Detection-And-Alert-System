from .. import db

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
    db.init_db(DEFAULT_CONFIG)
    config = db.get_config()
    if not config:
        return DEFAULT_CONFIG.copy()
    config.pop("id", None)
    return config

def save_config(config):
    """Save system configuration"""
    db.init_db(DEFAULT_CONFIG)
    return db.save_config(config)

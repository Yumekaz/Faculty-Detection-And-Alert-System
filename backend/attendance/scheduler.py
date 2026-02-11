from datetime import datetime

from .. import db
from ..config.config_store import DEFAULT_CONFIG

# Default Schedule for initialization
DEFAULT_SCHEDULE = [
    {"period": 1, "start": "09:00", "end": "10:00", "faculty": "Dr. Smith"},
    {"period": 2, "start": "10:00", "end": "11:00", "faculty": "Prof. Johnson"},
    {"period": 3, "start": "11:00", "end": "12:00", "faculty": "Dr. Brown"},
    {"period": 4, "start": "13:00", "end": "14:00", "faculty": "Ms. Davis"},
]

def load_schedule():
    """Loads schedule from JSON file, creates default if missing."""
    db.init_db(DEFAULT_CONFIG)
    data = db.get_schedule()
    if not data:
        save_schedule(DEFAULT_SCHEDULE)
        return DEFAULT_SCHEDULE
    return data

def save_schedule(schedule_data):
    """Saves schedule list to JSON file."""
    db.init_db(DEFAULT_CONFIG)
    return db.save_schedule(schedule_data)

def get_current_period():
    """Returns the current period dict if active, else None."""
    schedule = load_schedule()
    now = datetime.now()
    current_time_str = now.strftime("%H:%M")
    
    # Convert string times to comparison objects
    curr = datetime.strptime(current_time_str, "%H:%M").time()
    
    for slot in schedule:
        try:
            start = datetime.strptime(slot['start'], "%H:%M").time()
            end = datetime.strptime(slot['end'], "%H:%M").time()
            
            if start <= curr < end:
                return slot
        except ValueError:
            continue
            
    return None

def get_next_period():
    """Returns the next upcoming period dict, else None."""
    schedule = load_schedule()
    now = datetime.now()
    current_time_str = now.strftime("%H:%M")
    curr = datetime.strptime(current_time_str, "%H:%M").time()
    
    next_slot = None
    min_diff = float('inf')
    
    for slot in schedule:
        try:
            start = datetime.strptime(slot['start'], "%H:%M").time()
            # Calculate minutes until start
            curr_minutes = curr.hour * 60 + curr.minute
            start_minutes = start.hour * 60 + start.minute
            
            diff = start_minutes - curr_minutes
            
            if diff > 0 and diff < min_diff:
                min_diff = diff
                next_slot = slot
        except ValueError:
            continue
            
    return next_slot

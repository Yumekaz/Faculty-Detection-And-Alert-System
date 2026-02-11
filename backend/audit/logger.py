from datetime import datetime
from typing import Optional

from .. import db
from ..config.config_store import DEFAULT_CONFIG


def log_event(action: str, status: str, details: str, actor: Optional[str] = None):
    """Append an audit event to the CSV log."""
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    actor_value = actor or "system"
    db.init_db(DEFAULT_CONFIG)
    db.add_audit_log({
        "timestamp": ts,
        "actor": actor_value,
        "action": action,
        "status": status,
        "details": details,
    })

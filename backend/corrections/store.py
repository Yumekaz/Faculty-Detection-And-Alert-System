from datetime import datetime
from typing import List, Dict

from .. import db
from ..config.config_store import DEFAULT_CONFIG


def load_corrections(status: str | None = None) -> List[Dict]:
    db.init_db(DEFAULT_CONFIG)
    return db.list_corrections(status=status)


def save_correction(item: Dict) -> bool:
    db.init_db(DEFAULT_CONFIG)
    return db.save_correction(item)


def now_ts() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

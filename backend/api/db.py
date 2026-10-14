from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from backend.config import DB_URL

_engine = None

def get_engine():
    global _engine
    if _engine is None:
        kwargs = {}
        if DB_URL.startswith("sqlite"):
            kwargs = {
                "connect_args": {"check_same_thread": False},
                "poolclass": StaticPool,
            }
        _engine = create_engine(DB_URL, echo=False, **kwargs)
    return _engine

def query(sql: str, params: dict = None):
    from sqlalchemy import text
    with get_engine().connect() as conn:
        result = conn.execute(text(sql), params or {})
        rows = result.fetchall()
        keys = list(result.keys())
    return [dict(zip(keys, row)) for row in rows]
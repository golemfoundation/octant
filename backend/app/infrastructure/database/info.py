from sqlite3 import OperationalError

from sqlalchemy import text

from app.extensions import db


def is_db_responsive() -> bool:
    try:
        result = db.session.execute(text("SELECT 1")).fetchall()
        return len(result) > 0
    except OperationalError:
        return False

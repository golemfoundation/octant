from app.extensions import db
from app.database.models import OnchainSnapshot
from sqlalchemy import select, desc


def get_last_snapshot() -> int:
    db_epoch = (
        db.session.query(OnchainSnapshot)
        .order_by(desc(OnchainSnapshot.epoch_no))
        .first()
    )

    return db_epoch.epoch_no if db_epoch else 0

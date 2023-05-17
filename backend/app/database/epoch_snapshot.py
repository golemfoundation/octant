from sqlalchemy import desc

from app.database.models import EpochSnapshot
from app.extensions import db


def get_last_snapshot() -> EpochSnapshot:
    return db.session.query(EpochSnapshot).order_by(desc(EpochSnapshot.epoch)).first()


def add_snapshot(epoch: int, glm_supply: int, eth_proceeds: int, total_ed: int):
    snapshot = EpochSnapshot(
        epoch=epoch,
        glm_supply=str(glm_supply),
        eth_proceeds=str(eth_proceeds),
        total_effective_deposit=str(total_ed),
    )
    db.session.add(snapshot)

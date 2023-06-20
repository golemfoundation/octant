from sqlalchemy import desc

from app.database.models import EpochSnapshot
from app.extensions import db
from app import exceptions

from decimal import Decimal


def get_by_epoch_num(epoch) -> EpochSnapshot:
    snapshot = EpochSnapshot.query.filter_by(epoch=epoch).first()

    if snapshot is None:
        raise exceptions.InvalidEpoch()

    return snapshot


def get_last_snapshot() -> EpochSnapshot:
    snapshot = (
        db.session.query(EpochSnapshot).order_by(desc(EpochSnapshot.epoch)).first()
    )

    if snapshot is None:
        raise exceptions.MissingSnapshot()

    return snapshot


def add_snapshot(
    epoch: int,
    glm_supply: int,
    eth_proceeds: int,
    total_ed: int,
    locked_ratio: Decimal,
    total_rewards: int,
    all_individual_rewards: int,
):
    snapshot = EpochSnapshot(
        epoch=epoch,
        glm_supply=str(glm_supply),
        eth_proceeds=str(eth_proceeds),
        total_effective_deposit=str(total_ed),
        locked_ratio="{:f}".format(locked_ratio),
        total_rewards=str(total_rewards),
        all_individual_rewards=str(all_individual_rewards),
    )
    db.session.add(snapshot)

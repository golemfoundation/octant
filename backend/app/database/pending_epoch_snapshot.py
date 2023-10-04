from sqlalchemy import desc

from app.database.models import PendingEpochSnapshot
from app.extensions import db
from app import exceptions

from decimal import Decimal


def get_by_epoch_num(epoch) -> PendingEpochSnapshot:
    snapshot = PendingEpochSnapshot.query.filter_by(epoch=epoch).first()

    if snapshot is None:
        raise exceptions.InvalidEpoch()

    return snapshot


def get_last_snapshot() -> PendingEpochSnapshot:
    snapshot = (
        db.session.query(PendingEpochSnapshot)
        .order_by(desc(PendingEpochSnapshot.epoch))
        .first()
    )

    if snapshot is None:
        raise exceptions.MissingSnapshot()

    return snapshot


def add_snapshot(
    epoch: int,
    eth_proceeds: int,
    total_ed: int,
    locked_ratio: Decimal,
    total_rewards: int,
    all_individual_rewards: int,
):
    snapshot = PendingEpochSnapshot(
        epoch=epoch,
        eth_proceeds=str(eth_proceeds),
        total_effective_deposit=str(total_ed),
        locked_ratio="{:f}".format(locked_ratio),
        total_rewards=str(total_rewards),
        all_individual_rewards=str(all_individual_rewards),
    )
    db.session.add(snapshot)

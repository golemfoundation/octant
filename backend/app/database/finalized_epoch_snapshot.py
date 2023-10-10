from sqlalchemy import desc

from app import exceptions
from app.database.models import FinalizedEpochSnapshot
from app.extensions import db


def get_by_epoch_num(epoch) -> FinalizedEpochSnapshot:
    snapshot = FinalizedEpochSnapshot.query.filter_by(epoch=epoch).first()

    if snapshot is None:
        raise exceptions.InvalidEpoch()

    return snapshot


def get_last_snapshot() -> FinalizedEpochSnapshot:
    snapshot = (
        db.session.query(FinalizedEpochSnapshot)
        .order_by(desc(FinalizedEpochSnapshot.epoch))
        .first()
    )

    if snapshot is None:
        raise exceptions.MissingSnapshot()

    return snapshot


def add_snapshot(
    epoch: int,
    matched_rewards: int,
    withdrawals_merkle_root: str = None,
    total_withdrawals: int = None,
):
    snapshot = FinalizedEpochSnapshot(
        epoch=epoch,
        matched_rewards=str(matched_rewards),
        withdrawals_merkle_root=withdrawals_merkle_root,
        total_withdrawals=str(total_withdrawals)
        if total_withdrawals is not None
        else None,
    )
    db.session.add(snapshot)

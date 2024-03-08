from sqlalchemy import desc
from typing_extensions import deprecated

from app import exceptions
from app.extensions import db
from app.infrastructure.database.models import FinalizedEpochSnapshot


@deprecated("Exceptions should be raised in services, use `get_by_epoch` instead")
def get_by_epoch_num(epoch) -> FinalizedEpochSnapshot:
    snapshot = FinalizedEpochSnapshot.query.filter_by(epoch=epoch).first()

    if snapshot is None:
        raise exceptions.InvalidEpoch()

    return snapshot


def get_by_epoch(epoch: int) -> FinalizedEpochSnapshot:
    return FinalizedEpochSnapshot.query.filter_by(epoch=epoch).first()


def get_last_snapshot() -> FinalizedEpochSnapshot:
    snapshot = (
        db.session.query(FinalizedEpochSnapshot)
        .order_by(desc(FinalizedEpochSnapshot.epoch))
        .first()
    )

    if snapshot is None:
        raise exceptions.MissingSnapshot()

    return snapshot


def save_snapshot(
    epoch: int,
    matched_rewards: int,
    patrons_rewards: int,
    leftover: int,
    withdrawals_merkle_root: str = None,
    total_withdrawals: int = 0,
):
    snapshot = FinalizedEpochSnapshot(
        epoch=epoch,
        matched_rewards=str(matched_rewards),
        withdrawals_merkle_root=withdrawals_merkle_root,
        patrons_rewards=str(patrons_rewards),
        leftover=str(leftover),
        total_withdrawals=str(total_withdrawals),
    )
    db.session.add(snapshot)

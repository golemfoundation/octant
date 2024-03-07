from typing import Optional

from sqlalchemy import desc
from typing_extensions import deprecated

from app.infrastructure.database.models import PendingEpochSnapshot
from app.extensions import db
from app import exceptions

from decimal import Decimal


@deprecated("Exceptions should be raised in services, use `get_by_epoch` instead")
def get_by_epoch_num(epoch) -> PendingEpochSnapshot:
    snapshot = PendingEpochSnapshot.query.filter_by(epoch=epoch).first()

    if snapshot is None:
        raise exceptions.InvalidEpoch()

    return snapshot


def get_by_epoch(epoch: int) -> Optional[PendingEpochSnapshot]:
    return PendingEpochSnapshot.query.filter_by(epoch=epoch).first()


def get_last_snapshot() -> PendingEpochSnapshot:
    snapshot = (
        db.session.query(PendingEpochSnapshot)
        .order_by(desc(PendingEpochSnapshot.epoch))
        .first()
    )

    if snapshot is None:
        raise exceptions.MissingSnapshot()

    return snapshot


def save_snapshot(
    epoch: int,
    eth_proceeds: int,
    total_ed: int,
    locked_ratio: Decimal,
    total_rewards: int,
    all_individual_rewards: int,
    operational_cost: int,
    community_fund: int | None = None,
    ppf: int | None = None,
):
    snapshot = PendingEpochSnapshot(
        epoch=epoch,
        eth_proceeds=str(eth_proceeds),
        total_effective_deposit=str(total_ed),
        locked_ratio="{:f}".format(locked_ratio),
        total_rewards=str(total_rewards),
        all_individual_rewards=str(all_individual_rewards),
        operational_cost=str(operational_cost),
        community_fund=str(community_fund) if community_fund else None,
        ppf=str(ppf) if ppf else None,
    )
    db.session.add(snapshot)

from app.infrastructure.database.models import (
    FinalizedEpochSnapshot,
    PendingEpochSnapshot,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from v2.snapshots.schemas import FinalizedSnapshotResponseV1, OctantRewardsV1

from app import exceptions


async def get_pending_epoch_snapshot(
    session: AsyncSession, epoch_number: int
) -> PendingEpochSnapshot | None:
    result = await session.execute(
        select(PendingEpochSnapshot).filter(PendingEpochSnapshot.epoch == epoch_number)
    )
    return result.scalar_one_or_none()


async def get_finalized_epoch_snapshot(
    session: AsyncSession, epoch_number: int
) -> FinalizedEpochSnapshot | None:
    result = await session.execute(
        select(FinalizedEpochSnapshot).filter(
            FinalizedEpochSnapshot.epoch == epoch_number
        )
    )
    return result.scalar_one_or_none()


async def get_last_finalized_snapshot_epoch_number(
    session: AsyncSession,
) -> int:
    result = await session.scalar(
        select(FinalizedEpochSnapshot.epoch)
        .order_by(FinalizedEpochSnapshot.epoch.desc())
        .limit(1)
    )

    return int(result) or 0


async def get_last_finalized_epoch_snapshot(
    session: AsyncSession,
) -> FinalizedEpochSnapshot:
    """
    Returns the last finalized epoch snapshot.
    Raises MissingSnapshot if no snapshot is found.
    """

    result = await session.execute(
        select(FinalizedEpochSnapshot)
        .order_by(FinalizedEpochSnapshot.epoch.desc())
        .limit(1)
    )

    snapshot = result.scalar_one_or_none()
    if snapshot is None:
        raise exceptions.MissingSnapshot()

    return snapshot


async def get_last_pending_snapshot_epoch_number(
    session: AsyncSession,
) -> int:
    result = await session.scalar(
        select(PendingEpochSnapshot.epoch)
        .order_by(PendingEpochSnapshot.epoch.desc())
        .limit(1)
    )

    return int(result) or 0


async def save_pending_snapshot(
    session: AsyncSession,
    epoch_number: int,
    rewards: OctantRewardsV1,
) -> None:
    """
    Based on rewards object, create and save a pending snapshot in the database.
    """

    snapshot = PendingEpochSnapshot(
        epoch=epoch_number,
        eth_proceeds=str(rewards.staking_proceeds),
        total_effective_deposit=str(rewards.total_effective_deposit),
        locked_ratio="{:f}".format(rewards.locked_ratio),
        total_rewards=str(rewards.total_rewards),
        vanilla_individual_rewards=str(rewards.vanilla_individual_rewards),
        operational_cost=str(rewards.operational_cost),
        community_fund=str(rewards.community_fund) if rewards.community_fund else None,
        ppf=str(rewards.ppf) if rewards.ppf else None,
    )
    session.add(snapshot)


async def save_finalized_snapshot(
    session: AsyncSession,
    epoch_number: int,
    finalized_snapshot: FinalizedSnapshotResponseV1,
):
    """
    Saves a finalized snapshot to the database.
    """

    snapshot = FinalizedEpochSnapshot(
        epoch=epoch_number,
        matched_rewards=str(finalized_snapshot.matched_rewards),
        withdrawals_merkle_root=finalized_snapshot.merkle_root,
        patrons_rewards=str(finalized_snapshot.patrons_rewards),
        leftover=str(finalized_snapshot.leftover),
        total_withdrawals=str(finalized_snapshot.total_withdrawals),
    )
    session.add(snapshot)

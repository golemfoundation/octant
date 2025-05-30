from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.models import Reward
from v2.snapshots.schemas import ProjectRewardsV1, UserRewardsV1
from v2.core.types import Address


async def get_rewards_for_epoch(
    session: AsyncSession, epoch_number: int
) -> list[Reward]:
    """
    Get all rewards for a given epoch.
    """

    results = await session.scalars(
        select(Reward)
        .where(Reward.epoch == epoch_number)
        .order_by(Reward.address.asc())
    )

    return list(results.all())


async def get_rewards_for_projects_in_epoch(
    session: AsyncSession, epoch_number: int, projects_addresses: list[Address]
) -> list[Reward]:
    """
    Get all rewards for a given epoch for a list of projects.
    """

    results = await session.scalars(
        select(Reward)
        .where(Reward.epoch == epoch_number)
        .where(Reward.address.in_(projects_addresses))
        .order_by(Reward.address.asc())
    )

    return list(results.all())


async def get_by_address_and_epoch_gt(
    session: AsyncSession, address: Address, epoch_number: int
) -> list[Reward]:
    """
    Get all rewards for a given address for epochs greater than the given epoch number.
    """

    results = await session.scalars(
        select(Reward)
        .where(Reward.address == address, Reward.epoch > epoch_number)
        .order_by(Reward.epoch.asc())
    )

    return list(results.all())


async def save_rewards(
    session: AsyncSession,
    epoch_number: int,
    project_rewards: list[ProjectRewardsV1],
    user_rewards: list[UserRewardsV1],
):
    """
    Saves project and user rewards for a given epoch.
    """

    p_rewards = [
        Reward(
            epoch=epoch_number,
            address=project_reward.address,
            amount=str(project_reward.amount),
            matched=str(project_reward.matched),
        )
        for project_reward in project_rewards
    ]

    u_rewards = [
        Reward(
            epoch=epoch_number,
            address=user_reward.address,
            amount=str(user_reward.amount),
            matched=None,
        )
        for user_reward in user_rewards
    ]

    session.add_all(p_rewards + u_rewards)

from email.headerregistry import Address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.models import Reward


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

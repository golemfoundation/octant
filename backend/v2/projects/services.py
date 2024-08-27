from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from v2.allocations.repositories import (
    get_allocations_with_user_uqs,
    sum_allocations_by_epoch,
)
from v2.epoch_snapshots.repositories import get_pending_epoch_snapshot
from v2.epochs.subgraphs import EpochsSubgraph
from v2.project_rewards.capped_quadriatic import (
    CappedQuadriaticFunding,
    capped_quadriatic_funding,
)
from v2.projects.contracts import ProjectsContracts
from v2.user_patron_mode.repositories import get_patrons_rewards


async def get_projects_allocation_threshold(
    # Dependencies
    session: AsyncSession,
    projects: ProjectsContracts,
    # Arguments
    epoch_number: int,
    project_count_multiplier: int = 1,
) -> int:
    # PROJECTS_COUNT_MULTIPLIER = 1  # TODO: from settings?

    total_allocated = await sum_allocations_by_epoch(session, epoch_number)
    project_addresses = await projects.get_project_addresses(epoch_number)

    print("total_allocated", total_allocated)
    print("project_addresses", project_addresses)

    return _calculate_threshold(
        total_allocated, len(project_addresses), project_count_multiplier
    )


def _calculate_threshold(
    total_allocated: int,
    projects_count: int,
    project_count_multiplier: int,
) -> int:
    return (
        int(total_allocated / (projects_count * project_count_multiplier))
        if projects_count
        else 0
    )


async def get_estimated_project_rewards(
    # Dependencies
    session: AsyncSession,
    projects: ProjectsContracts,
    epochs_subgraph: EpochsSubgraph,
    # Arguments
    epoch_number: int,
) -> CappedQuadriaticFunding:
    # project_settings  project is ProjectSettings
    all_projects = await projects.get_project_addresses(epoch_number)

    matched_rewards = await get_estimated_project_matched_rewards_pending(
        session,
        epochs_subgraph=epochs_subgraph,
        epoch_number=epoch_number,
    )
    allocations = await get_allocations_with_user_uqs(session, epoch_number)

    return capped_quadriatic_funding(
        project_addresses=all_projects,
        allocations=allocations,
        matched_rewards=matched_rewards,
    )


TR_PERCENT = Decimal("0.7")
IRE_PERCENT = Decimal("0.35")
MATCHED_REWARDS_PERCENT = Decimal("0.35")


async def get_estimated_project_matched_rewards_pending(
    # Dependencies
    session: AsyncSession,
    epochs_subgraph: EpochsSubgraph,
    # projects: Projects,
    # Arguments
    epoch_number: int,
) -> int:
    """
    Get the estimated matched rewards for the pending epoch.
    """

    pending_snapshot = await get_pending_epoch_snapshot(session, epoch_number)
    if pending_snapshot is None:
        raise ValueError(f"No pending snapshot for epoch {epoch_number}")

    epoch_details = await epochs_subgraph.get_epoch_by_number(epoch_number)
    patrons_rewards = await get_patrons_rewards(
        session, epoch_details.finalized_timestamp.datetime(), epoch_number
    )

    # fmt: off
    return _calculate_percentage_matched_rewards(
        locked_ratio            = Decimal(pending_snapshot.locked_ratio),
        tr_percent              = TR_PERCENT,
        ire_percent             = IRE_PERCENT,
        staking_proceeds        = int(pending_snapshot.eth_proceeds),
        patrons_rewards         = patrons_rewards,
        matched_rewards_percent = MATCHED_REWARDS_PERCENT,
    )
    # fmt: on


def _calculate_percentage_matched_rewards(
    locked_ratio: Decimal,
    tr_percent: Decimal,
    ire_percent: Decimal,
    staking_proceeds: int,
    patrons_rewards: int,
    matched_rewards_percent: Decimal,  # Config
) -> int:
    if locked_ratio > tr_percent:
        raise ValueError("Invalid Strategy - locked_ratio > tr_percent")

    if locked_ratio < ire_percent:
        return int(matched_rewards_percent * staking_proceeds + patrons_rewards)
    elif ire_percent <= locked_ratio < tr_percent:
        return int((tr_percent - locked_ratio) * staking_proceeds + patrons_rewards)
    return patrons_rewards

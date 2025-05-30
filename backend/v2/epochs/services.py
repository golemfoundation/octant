from collections import defaultdict
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.models import (
    FinalizedEpochSnapshot,
    PendingEpochSnapshot,
)
from app.modules.staking.proceeds.core import estimate_staking_proceeds
from v2.allocations.repositories import get_allocations_with_user_uqs
from v2.core.types import Address
from v2.deposits.dependencies import (
    DepositsSettings,
)
from v2.deposits.services import DepositEventsStore
from v2.epochs.contracts import EpochsContract
from v2.epochs.subgraphs import EpochsSubgraph
from v2.glms.contracts import GLMContracts
from v2.glms.dependencies import get_glm_balance_of_deposits
from v2.matched_rewards.dependencies import (
    MatchedRewardsEstimatorSettings,
)
from v2.matched_rewards.services import _calculate_percentage_matched_rewards
from v2.project_rewards.capped_quadratic import capped_quadratic_funding
from v2.project_rewards.services import (
    calculate_effective_deposits,
    calculate_octant_rewards,
)
from v2.projects.contracts import ProjectsContracts
from v2.snapshots.services import calculate_leftover
from v2.staking_proceeds.services import StakingProceeds
from v2.user_patron_mode.repositories import get_patrons_rewards
from v2.withdrawals.repositories import get_all_users_claimed_rewards
from v2.epochs.schemas import EpochStatsResponseV1


async def get_epoch_info_future(
    # Dependencies
    epochs_contracts: EpochsContract,
    glm_contracts: GLMContracts,
    deposits_settings: DepositsSettings,
) -> EpochStatsResponseV1:
    """
    Calculate information for a future epoch based on current contract state.
    """
    future_epoch_props = await epochs_contracts.get_future_epoch_props()
    epoch_duration = future_epoch_props[3]

    # We interpolate future rewards based on the future epoch
    # duration and total effective deposit of the finalized epoch
    eth_proceeds = estimate_staking_proceeds(epoch_duration)
    total_effective_deposit = await get_glm_balance_of_deposits(
        glm_contracts, deposits_settings
    )
    future_rewards = calculate_octant_rewards(eth_proceeds, total_effective_deposit)

    return EpochStatsResponseV1(
        staking_proceeds=eth_proceeds,
        total_effective_deposit=total_effective_deposit,
        total_rewards=future_rewards.total_rewards,
        vanilla_individual_rewards=future_rewards.vanilla_individual_rewards,
        operational_cost=future_rewards.operational_cost,
        total_withdrawals=None,  # Future so no withdrawals (yet)
        patrons_rewards=None,  # Future so no patrons (yet)
        matched_rewards=None,  # Future so no matched rewards (yet)
        leftover=None,  # Future so no leftover (yet)
        ppf=future_rewards.ppf,
        community_fund=future_rewards.community_fund,
        donated_to_projects=None,  # Future so no donated to projects (yet)
    )


async def get_epoch_info_current(
    # Dependencies
    epochs_subgraph: EpochsSubgraph,
    deposit_events_repository: DepositEventsStore,
    # Parameters
    epoch_number: int,
) -> EpochStatsResponseV1:
    """
    Calculate information for the current epoch.
    """
    epoch_details = await epochs_subgraph.fetch_epoch_by_number(epoch_number)

    # We need the beginning and end of the epoch to calculate the staking proceeds
    epoch_start = epoch_details.fromTs
    epoch_end = epoch_start + epoch_details.duration

    # Calculate pending snapshot
    eth_proceeds = estimate_staking_proceeds(epoch_end - epoch_start)
    # Based on all deposit events, calculate effective deposits
    events = await deposit_events_repository.get_all_users_events(
        epoch_number, epoch_start, epoch_end
    )
    _, total_effective_deposit = calculate_effective_deposits(
        epoch_start, epoch_end, events
    )

    # Calculate octant rewards
    rewards = calculate_octant_rewards(eth_proceeds, total_effective_deposit)

    return EpochStatsResponseV1(
        staking_proceeds=eth_proceeds,
        total_effective_deposit=total_effective_deposit,
        total_rewards=rewards.total_rewards,
        vanilla_individual_rewards=rewards.vanilla_individual_rewards,
        operational_cost=rewards.operational_cost,
        total_withdrawals=None,  # Current epoch so no withdrawals yet
        patrons_rewards=None,  # Current epoch so no patrons yet
        matched_rewards=None,  # Current epoch so no matched rewards yet
        leftover=None,  # Current epoch so no leftover yet
        ppf=rewards.ppf,
        community_fund=rewards.community_fund,
        donated_to_projects=None,  # Current epoch so no donated to projects yet
    )


async def get_epoch_info_pre_pending(
    # Dependencies
    epochs_subgraph: EpochsSubgraph,
    deposit_events_repository: DepositEventsStore,
    staking_proceeds_calc: StakingProceeds,
    # Parameters
    epoch_number: int,
) -> EpochStatsResponseV1:
    """
    Calculate information for a pre-pending epoch.
    """
    epoch_details = await epochs_subgraph.fetch_epoch_by_number(epoch_number)
    epoch_start = epoch_details.fromTs
    epoch_end = epoch_start + epoch_details.duration

    # INFO: Staking proceeds
    #   Mainnet: we calculate it based on aggregated transactions (bitquery + etherscan)
    #   Testnet: we use the balance of the contract
    staking_proceeds = await staking_proceeds_calc.get(epoch_start, epoch_end)

    # Based on all deposit events, calculate effective deposits
    events = await deposit_events_repository.get_all_users_events(
        epoch_number, epoch_start, epoch_end
    )
    _, total_effective_deposit = calculate_effective_deposits(
        epoch_start, epoch_end, events
    )

    # Calculate octant rewards
    rewards = calculate_octant_rewards(staking_proceeds, total_effective_deposit)

    return EpochStatsResponseV1(
        staking_proceeds=staking_proceeds,
        total_effective_deposit=total_effective_deposit,
        total_rewards=rewards.total_rewards,
        vanilla_individual_rewards=rewards.vanilla_individual_rewards,
        operational_cost=rewards.operational_cost,
        total_withdrawals=None,  # Pre-pending so no withdrawals yet
        patrons_rewards=None,  # Pre-pending so no patrons yet
        matched_rewards=None,  # Pre-pending so no matched rewards yet
        leftover=None,  # Pre-pending so no leftover yet
        ppf=rewards.ppf,
        community_fund=rewards.community_fund,
        donated_to_projects=None,  # Pre-pending so no donated to projects yet
    )


async def get_epoch_info_pending(
    # Dependencies
    epochs_subgraph: EpochsSubgraph,
    projects_contracts: ProjectsContracts,
    session: AsyncSession,
    matched_rewards_settings: MatchedRewardsEstimatorSettings,
    # Parameters
    epoch_number: int,
    pending_snapshot: PendingEpochSnapshot,
) -> EpochStatsResponseV1:
    """
    Calculate information for a pending epoch.
    This is basically the same as calculation of pending snapshot.
    """
    epoch_details = await epochs_subgraph.get_epoch_by_number(epoch_number)
    patron_rewards = await get_patrons_rewards(
        session, epoch_details.finalized_timestamp.datetime(), epoch_number
    )

    # How much will octant match other donations?
    matched_rewards = _calculate_percentage_matched_rewards(
        locked_ratio=Decimal(pending_snapshot.locked_ratio),
        tr_percent=matched_rewards_settings.TR_PERCENT,
        ire_percent=matched_rewards_settings.IRE_PERCENT,
        staking_proceeds=int(pending_snapshot.eth_proceeds),
        patrons_rewards=patron_rewards,
        matched_rewards_percent=matched_rewards_settings.MATCHED_REWARDS_PERCENT,
    )

    # Let's actually calculate QF for all projects here
    all_allocations = await get_allocations_with_user_uqs(session, epoch_number)
    all_projects = await projects_contracts.get_project_addresses(epoch_number)
    funding = capped_quadratic_funding(
        all_allocations,
        matched_rewards,
        all_projects,
    )

    # How much each user took for themselfs (non zero only)
    # How much was allocated towards projects
    # How much was distibuted in total
    user_claimed_rewards = await get_all_users_claimed_rewards(session, epoch_number)
    claimed_rewards_sum = sum(user_claimed_rewards.values())
    donated_to_projects = (
        funding.allocations_total_for_all_projects
        + funding.matched_total_for_all_projects
    )
    total_withdrawals = claimed_rewards_sum + int(donated_to_projects)

    leftover = calculate_leftover(
        ppf=pending_snapshot.validated_ppf,
        total_matched_rewards=matched_rewards,
        used_matched_rewards=int(funding.matched_total_for_all_projects),
        total_withdrawals=total_withdrawals,
        staking_proceeds=int(pending_snapshot.eth_proceeds),
        operational_cost=int(pending_snapshot.operational_cost),
        community_fund=int(pending_snapshot.validated_community_fund)
        if pending_snapshot.validated_community_fund
        else 0,
    )

    return EpochStatsResponseV1(
        staking_proceeds=int(pending_snapshot.eth_proceeds),
        total_effective_deposit=int(pending_snapshot.total_effective_deposit),
        total_rewards=int(pending_snapshot.total_rewards),
        vanilla_individual_rewards=int(pending_snapshot.vanilla_individual_rewards),
        operational_cost=int(pending_snapshot.operational_cost),
        total_withdrawals=total_withdrawals,
        patrons_rewards=patron_rewards,
        matched_rewards=matched_rewards,
        leftover=leftover,
        ppf=pending_snapshot.validated_ppf,
        community_fund=pending_snapshot.validated_community_fund,
        donated_to_projects=int(donated_to_projects),
    )


def sum_allocations_below_threshold(
    epoch_number: int, alloc_total: int, alloc_sum_per_project: dict[Address, int]
) -> int:
    """
    Sum how much was allocated below threshold for all projects in given epoch.
    We use different thresholds for different epochs (1, 2, 3) and starting from epoch 4 we don't really care about thresholds anymore.
    """

    # Starting from epoch 4 we don't really care about thresholds anymore in this case
    if epoch_number >= 4:
        return 0

    # Calculate threshold based on the epoch number
    projects_count = len(alloc_sum_per_project)
    if epoch_number in [1, 2]:
        threshold = int(alloc_total / (projects_count * 2)) if projects_count else 0
    elif epoch_number == 3:
        threshold = int(alloc_total / (projects_count * 1)) if projects_count else 0
    else:
        threshold = 0

    # Sum how much was allocated below threshold for all projects in given epoch
    allocations_below_threshold = sum(
        alloc_sum
        for alloc_sum in alloc_sum_per_project.values()
        if alloc_sum < threshold
    )
    return allocations_below_threshold


async def get_epoch_info_finalized(
    # Dependencies
    epochs_subgraph: EpochsSubgraph,
    session: AsyncSession,
    # Parameters
    epoch_number: int,
    pending_snapshot: PendingEpochSnapshot,
    finalized_snapshot: FinalizedEpochSnapshot,
) -> EpochStatsResponseV1:
    """
    Calculate information for a finalized epoch.
    """

    # Calculate leftover based on pending and finalized snapshots
    # We only do it for epochs >= 4
    if epoch_number < 4:
        unused_matched_rewards = 0
    else:
        unused_matched_rewards = (
            int(finalized_snapshot.leftover)
            - int(pending_snapshot.eth_proceeds)
            + int(pending_snapshot.operational_cost)
            + int(pending_snapshot.community_fund)
            + int(pending_snapshot.validated_ppf / 2)  # extra individual rewards
            + int(finalized_snapshot.total_withdrawals)
        )

    # Group allocations by project address
    allocations = await get_allocations_with_user_uqs(session, epoch_number)
    alloc_sum_per_project: dict[Address, int] = defaultdict(int)
    alloc_total: int = 0
    for allocation in allocations:
        alloc_sum_per_project[allocation.project_address] += int(allocation.amount)
        alloc_total += int(allocation.amount)

    # Sum how much was allocated below threshold for all projects in given epoch
    alloc_total_below_threshold = sum_allocations_below_threshold(
        epoch_number, alloc_total, alloc_sum_per_project
    )

    donated_to_projects = (
        int(finalized_snapshot.matched_rewards)
        - unused_matched_rewards
        + alloc_total
        - alloc_total_below_threshold
    )

    return EpochStatsResponseV1(
        staking_proceeds=int(pending_snapshot.eth_proceeds),
        total_effective_deposit=int(pending_snapshot.total_effective_deposit),
        total_rewards=int(pending_snapshot.total_rewards),
        vanilla_individual_rewards=int(pending_snapshot.vanilla_individual_rewards),
        operational_cost=int(pending_snapshot.operational_cost),
        total_withdrawals=int(finalized_snapshot.total_withdrawals),
        patrons_rewards=int(finalized_snapshot.patrons_rewards),
        matched_rewards=int(finalized_snapshot.matched_rewards),
        leftover=int(finalized_snapshot.leftover),
        ppf=pending_snapshot.validated_ppf,
        community_fund=pending_snapshot.validated_community_fund,
        donated_to_projects=donated_to_projects,
    )

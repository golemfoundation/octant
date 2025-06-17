"""
Epoch management endpoints for handling epoch information and statistics.

This module provides endpoints for querying epoch information, including:
- Current and indexed epoch numbers
- Detailed epoch statistics
- Rewards rate information

Key Concepts:
    - Epoch: A time period during which deposits are collected and rewards are distributed
    - Current Epoch: The active epoch number from the blockchain
    - Indexed Epoch: The last epoch that has been fully indexed in the subgraph
    - Epoch States:
        - Future: Epochs that haven't started yet
        - Current: The currently active epoch
        - Pre-Pending: Epoch that has ended but allocation window hasn't started
        - Pending: Epoch in allocation window (snapshot taken, allocations open)
        - Finalized: Epoch that has completed allocation window and rewards distribution

    - Snapshots:
        - Pending Snapshot: Taken at the start of allocation window, contains:
            - Staking proceeds
            - Total effective deposits
            - Locked ratio
            - Operational costs
            - PPF and community fund
        - Finalized Snapshot: Taken after allocation window, contains:
            - All pending snapshot data
            - Final allocations and rewards distribution
            - Matched rewards calculations
            - Leftover amounts

    - Rewards Components:
        - Staking Proceeds: ETH earned from staking
        - Total Effective Deposit: Sum of all effective deposits
        - Vanilla Individual Rewards: Base rewards for users
        - Operational Cost: Octant's operational expenses
        - Patrons Rewards: Matching funds from patrons
        - Matched Rewards: Additional rewards from Golem Foundation and patrons
        - PPF (Patronage Power Factor): Calculated from Individual Rewards Equilibrium
        - Community Fund: Direct allocation from staking proceeds
        - Leftover: Unused rewards for future operations
"""

from fastapi import APIRouter

from app.exceptions import MissingSnapshot
from v2.matched_rewards.dependencies import GetMatchedRewardsSettings
from v2.projects.dependencies import GetProjectsContracts
from v2.core.dependencies import GetSession
from v2.deposits.dependencies import (
    GetDepositEventsRepository,
    GetDepositsSettings,
)
from v2.glms.dependencies import GetGLMContracts
from v2.snapshots.repositories import (
    get_finalized_epoch_snapshot,
    get_pending_epoch_snapshot,
)
from v2.staking_proceeds.dependencies import GetStakingProceeds
from v2.epochs.dependencies import (
    GetCurrentEpoch,
    GetEpochsContracts,
    GetEpochsSubgraph,
    GetIndexedEpoch,
    GetRewardsRate,
)
from v2.epochs.schemas import (
    CurrentEpochResponseV1,
    EpochStatsResponseV1,
    IndexedEpochResponseV1,
    EpochRewardsRateResponseV1,
)
from v2.epochs.services import (
    get_epoch_info_finalized,
    get_epoch_info_future,
    get_epoch_info_current,
    get_epoch_info_pre_pending,
    get_epoch_info_pending,
)

api = APIRouter(prefix="/epochs", tags=["Epochs"])


@api.get("/current")
async def get_current_epoch_v1(
    current_epoch: GetCurrentEpoch,
) -> CurrentEpochResponseV1:
    """
    Returns the current epoch number from the blockchain.

    This endpoint queries the smart contract to get the current active epoch number.
    The epoch number is used throughout the system to track allocation periods
    and rewards distribution cycles.

    Returns:
        CurrentEpochResponseV1 containing:
            - current_epoch: The current active epoch number from the blockchain

    Note:
        - This is the source of truth for the current epoch
        - Used to determine which epoch state to show
        - May differ from indexed_epoch if subgraph is still catching up
    """
    return CurrentEpochResponseV1(current_epoch=current_epoch)


@api.get("/indexed")
async def get_indexed_epoch_v1(
    current_epoch: GetCurrentEpoch, indexed_epoch: GetIndexedEpoch
) -> IndexedEpochResponseV1:
    """
    Returns the last indexed epoch number and current epoch number from the blockchain.

    This endpoint provides information about the indexing status of epochs by returning both
    the current epoch number and the last epoch that has been fully indexed in the subgraph.
    The indexed epoch will always be less than or equal to the current epoch.
    If they differ, it means the subgraph is still being updated.

    Returns:
        IndexedEpochResponseV1 containing:
            - current_epoch: The current active epoch number from the blockchain
            - indexed_epoch: The last epoch fully indexed in the subgraph

    Note:
        - Used to determine if subgraph data is up to date
        - Indexed epoch is always <= current epoch
        - Some features may be limited if current_epoch > indexed_epoch
    """
    return IndexedEpochResponseV1(
        current_epoch=current_epoch, indexed_epoch=indexed_epoch
    )


@api.get("/info/{epoch_number}")
async def get_epoch_stats_v1(
    # Dependencies
    session: GetSession,
    epochs_contracts: GetEpochsContracts,
    projects_contracts: GetProjectsContracts,
    glm_contracts: GetGLMContracts,
    deposits_settings: GetDepositsSettings,
    epochs_subgraph: GetEpochsSubgraph,
    deposit_events_repository: GetDepositEventsRepository,
    staking_proceeds_calc: GetStakingProceeds,
    matched_rewards_settings: GetMatchedRewardsSettings,
    # Parameters
    epoch_number: int,
) -> EpochStatsResponseV1:
    """
    Returns detailed statistics for a specific epoch.

    This endpoint provides comprehensive information about an epoch's state, including
    deposits, rewards, and allocations. The response varies based on the epoch's state:

    States and Data Sources:
        - Future Epoch:
            - Interpolated based on current contract state
            - Uses current total effective deposit
            - Estimates staking proceeds based on epoch duration
            - No allocations or withdrawals data

        - Current Epoch:
            - Real-time data from subgraph and deposit events
            - Calculates effective deposits from events
            - Estimates staking proceeds
            - No allocations or withdrawals data

        - Pre-Pending Epoch:
            - Uses subgraph data and deposit events
            - Calculates staking proceeds from transactions
            - No snapshot data available yet
            - No allocations or withdrawals data

        - Pending Epoch:
            - Uses pending snapshot data
            - Includes patron rewards
            - Calculates matched rewards
            - Includes allocation data
            - Includes withdrawal data
            - Calculates leftover amounts

        - Finalized Epoch:
            - Uses both pending and finalized snapshots
            - Complete allocation and reward data
            - Final withdrawal amounts
            - Final leftover calculations

    Returns:
        EpochStatsResponseV1 containing:
            - staking_proceeds: ETH earned from staking
            - total_effective_deposit: Sum of all effective deposits
            - total_rewards: Total rewards for the epoch
            - vanilla_individual_rewards: Base rewards for users
            - operational_cost: Octant's operational expenses
            - total_withdrawals: Rewards withdrawn by users
            - patrons_rewards: Matching funds from patrons
            - matched_rewards: Additional rewards from Golem Foundation
            - leftover: Unused rewards for future operations
            - ppf: Patronage Power Factor
            - community_fund: Direct allocation from staking proceeds
            - donated_to_projects: Donations to projects below threshold

    Note:
        - Data availability depends on epoch state
        - Some fields may be null for future/current epochs
        - Finalized epochs have complete data
        - Pending epochs show allocation window data
    """

    current_epoch_number = await epochs_contracts.get_current_epoch()

    # FUTURE EPOCH
    if epoch_number > current_epoch_number:
        return await get_epoch_info_future(
            epochs_contracts, glm_contracts, deposits_settings
        )

    # CURRENT EPOCH
    if epoch_number == current_epoch_number:
        return await get_epoch_info_current(
            epochs_subgraph, deposit_events_repository, epoch_number
        )

    pending_epoch_number = await epochs_contracts.get_pending_epoch()
    pending_snapshot = await get_pending_epoch_snapshot(session, epoch_number)

    if epoch_number == pending_epoch_number:
        # PRE PENDING
        if pending_snapshot is None:
            return await get_epoch_info_pre_pending(
                epochs_subgraph,
                deposit_events_repository,
                staking_proceeds_calc,
                epoch_number,
            )

        # PENDING
        return await get_epoch_info_pending(
            epochs_subgraph,
            projects_contracts,
            session,
            matched_rewards_settings,
            epoch_number,
            pending_snapshot,
        )

    # If we don't have a pending snapshot at this point, it's bad...
    if pending_snapshot is None:
        raise MissingSnapshot(epoch_number)

    finalized_snapshot = await get_finalized_epoch_snapshot(session, epoch_number)
    if finalized_snapshot is None:
        # FINALIZING
        # This is the same as pending snapshot
        return await get_epoch_info_pending(
            epochs_subgraph,
            projects_contracts,
            session,
            matched_rewards_settings,
            epoch_number,
            pending_snapshot,
        )

    # FINALIZED
    return await get_epoch_info_finalized(
        epochs_subgraph,
        session,
        epoch_number,
        pending_snapshot,
        finalized_snapshot,
    )


@api.get("/rewards-rate/{epoch_number}")
async def get_epoch_rewards_rate_v1(
    rewards_rate: GetRewardsRate,
) -> EpochRewardsRateResponseV1:
    """
    Returns the rewards rate for a specific epoch from the blockchain.

    This endpoint queries the smart contract to get the rewards rate for the specified epoch number.
    The rewards rate represents the percentage of rewards distributed for that epoch and is used
    in calculating final reward amounts.

    Returns:
        EpochRewardsRateResponseV1 containing:
            - rewards_rate: The rewards rate percentage for the epoch

    Note:
        - Used in reward distribution calculations
        - Affects final reward amounts
        - Retrieved directly from blockchain
    """
    return EpochRewardsRateResponseV1(rewards_rate=rewards_rate)

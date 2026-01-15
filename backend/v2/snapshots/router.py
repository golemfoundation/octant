"""
Snapshot management endpoints for handling epoch state transitions and reward calculations.

This module provides endpoints for managing the snapshot lifecycle, including:
1. Pending snapshot creation and simulation
2. Finalized snapshot creation and simulation
3. Snapshot status tracking
4. Reward calculations and distributions

Key Concepts:
    - Snapshot Lifecycle:
        - Pending: Created at the beginning of the decision window
            (If we have pending epoch state but no pending snapshot
                we consider this as pre-pending state)
        - Finalized: Created at the end of the decision window
            (If we have finalized epoch state but no finalized snapshot
                we consider this as finalizing state)

    - Reward Calculations:
        - Staking Proceeds: ETH rewards from staking
        - Effective Deposits: User deposits weighted by time
        - Octant Rewards: Total rewards available for distribution
        - Matched Rewards: Additional rewards based on allocation patterns
        - Project Rewards: Quadratic funding distribution to projects
        - User Rewards: Direct withdrawals and allocations

    - Merkle Tree:
        - Used for efficient reward distribution verification
        - Contains proofs for all user and project rewards
        - Generated during finalization
        - Used for on-chain validation

    - Budget Components:
        - Staking Proceeds: Base rewards from staking
        - Operational Cost: System maintenance costs
        - Community Fund: Reserved for community initiatives
        - PPF (Patron Protection Fund): Reserved for patron rewards
        - Leftover: Unused rewards returned to staking

    - Epoch States:
        - Current: Active epoch
        - Pending: Epoch ended, allocation window open
        - Finalized: Allocation window closed, rewards distributed

    - Reward Distribution:
        - User Budgets: Based on effective deposits
        - Project Rewards: Based on quadratic funding
        - Matched Rewards: Based on allocation patterns
        - Patron Rewards: Special rewards for patron mode
        - Leftover: Returned to staking pool

    - Security Features:
        - Merkle tree for reward verification
        - State validation for snapshot creation
        - Duplicate prevention
        - Epoch state validation
"""

from decimal import Decimal
from fastapi import APIRouter, HTTPException, Response, status
from multiproof import StandardMerkleTree
from app import exceptions
from app.engine.user.budget.with_ppf import UserBudgetWithPPF
from app.modules.snapshots.pending.core import calculate_user_budgets
from v2.staking_proceeds.dependencies import GetStakingProceeds
from v2.allocations.repositories import get_allocations_with_user_uqs
from v2.deposits.dependencies import GetDepositEventsRepository
from v2.deposits.repositories import save_deposits
from v2.matched_rewards.dependencies import GetMatchedRewardsSettings
from v2.matched_rewards.services import (
    _calculate_percentage_matched_rewards,
    calculate_staking_matched_rewards,
)
from v2.project_rewards.capped_quadratic import capped_quadratic_funding
from v2.project_rewards.repositories import save_rewards
from v2.project_rewards.services import (
    calculate_effective_deposits,
    calculate_octant_rewards,
)
from v2.projects.dependencies import GetProjectsContracts
from v2.snapshots.services import calculate_leftover
from app.engine.epochs_settings import should_reserve_staking_for_v2
from v2.snapshots.repositories import (
    get_finalized_epoch_snapshot,
    get_pending_epoch_snapshot,
    save_finalized_snapshot,
    save_pending_snapshot,
)
from v2.user_patron_mode.repositories import get_patrons_rewards, save_budgets
from v2.withdrawals.repositories import get_all_users_claimed_rewards
from v2.core.dependencies import GetCurrentTimestamp, GetSession
from v2.epochs.dependencies import (
    GetCurrentEpoch,
    GetEpochsContracts,
    GetEpochsSubgraph,
    GetPendingEpoch,
)
from v2.snapshots.schemas import (
    EpochStatusResponseV1,
    FinalizedSnapshotResponseV1,
    OctantRewardsV1,
    PendingSnapshotResponseV1,
    ProjectRewardsV1,
    SnapshotCreatedResponseV1,
    UserBudgetV1,
    UserDepositV1,
    UserRewardsV1,
)


api = APIRouter(prefix="/snapshots", tags=["Snapshots"])


@api.get("/pending/simulate")
async def simulate_pending_snapshot_v1(
    # Dependencies
    epochs_subgraph: GetEpochsSubgraph,
    deposit_events_repository: GetDepositEventsRepository,
    # Staking Proceeds (we use one for mainnet and other for testnet)
    staking_proceeds_calc: GetStakingProceeds,
    # Parameters (injected as dependencies for simulation)
    epoch_number: GetCurrentEpoch,
    current_timestamp: GetCurrentTimestamp,
) -> PendingSnapshotResponseV1:
    """
    Simulates the pending snapshot without saving any data.

    This endpoint calculates what the pending snapshot would look like if created now.
    It's useful for previewing reward distributions before actual snapshot creation.

    Calculation Process:
    1. Get epoch time range (start to current timestamp)
    2. Calculate staking proceeds:
        - Mainnet: Based on aggregated transactions
        - Testnet: Based on contract balance
    3. Calculate effective deposits:
        - Process all deposit events
        - Weight deposits by time
        - Calculate total effective deposit
    4. Calculate octant rewards:
        - Based on staking proceeds and effective deposits
        - Include operational costs
        - Include community fund
        - Include PPF (Patron Protection Fund)
    5. Calculate user budgets:
        - Based on effective deposits
        - Apply PPF adjustments
        - Calculate individual rewards

    Returns:
        PendingSnapshotResponseV1 containing:
            - rewards: OctantRewardsV1 with all reward components
            - user_deposits: List of effective deposits per user
            - user_budgets: List of calculated budgets per user

    Note:
        - This is a simulation and doesn't persist any data
        - Uses current timestamp as epoch end
        - All calculations are based on current state
    """

    # For simulation we need the time range of the epoch (start and end)
    epoch_details = await epochs_subgraph.fetch_epoch_by_number(epoch_number)
    epoch_start = epoch_details.fromTs
    epoch_end = current_timestamp

    # INFO: Staking proceeds
    #   Mainnet: we calculate it based on aggregated transactions (bitquery + etherscan)
    #   Testnet: we use the balance of the contract
    staking_proceeds = await staking_proceeds_calc.get(epoch_start, epoch_end)

    # Based on all deposit events, calculate effective deposits
    events = await deposit_events_repository.get_all_users_events(
        epoch_number, epoch_start, epoch_end
    )
    user_deposits, total_effective_deposit = calculate_effective_deposits(
        epoch_start, epoch_end, events
    )

    # Calculate octant rewards
    rewards = calculate_octant_rewards(staking_proceeds, total_effective_deposit)

    # Calculate users budgets
    user_budget_calculator = UserBudgetWithPPF()
    user_budgets = calculate_user_budgets(
        user_budget_calculator, rewards, user_deposits
    )

    return PendingSnapshotResponseV1(
        rewards=OctantRewardsV1(
            staking_proceeds=rewards.staking_proceeds,
            locked_ratio=rewards.locked_ratio,
            total_effective_deposit=rewards.total_effective_deposit,
            total_rewards=rewards.total_rewards,
            vanilla_individual_rewards=rewards.vanilla_individual_rewards,
            operational_cost=rewards.operational_cost,
            community_fund=rewards.community_fund or 0,
            ppf=rewards.ppf or 0,
        ),
        user_deposits=[
            UserDepositV1(
                user_address=user_deposit.user_address,
                effective_deposit=user_deposit.effective_deposit,
                deposit=user_deposit.deposit,
            )
            for user_deposit in user_deposits
        ],
        user_budgets=[
            UserBudgetV1(
                user_address=user_budget.user_address,
                budget=user_budget.budget,
            )
            for user_budget in user_budgets
        ],
    )


@api.post("/pending")
async def create_pending_snapshot_v1(
    response: Response,
    session: GetSession,
    deposit_events_repository: GetDepositEventsRepository,
    staking_proceeds_calc: GetStakingProceeds,
    epochs_contracts: GetEpochsContracts,
    epochs_subgraph: GetEpochsSubgraph,
) -> SnapshotCreatedResponseV1 | None:
    """
    Creates a pending snapshot for the recently completed epoch.

    This endpoint should be called at the beginning of an epoch to activate
    the allocation window. It creates a snapshot of the epoch's final state
    and calculates initial reward distributions.
    Saves to the database:
        - User deposits
        - User budgets
        - Pending snapshot

    On mainnet we call this endpoint at the beginning of the allocation window manually.
    On testnets we have a cron job that calls this endpoint every minute so this will happen automatically.

    Process:
    1. Verify epoch is in pending state
    2. Check no pending snapshot exists
    3. Calculate snapshot using simulation
    4. Persist results:
        - Save user deposits
        - Save user budgets
        - Save reward calculations

    Returns:
        - 201: Snapshot created successfully
        - 200: Snapshot already exists
        - None: Epoch not in pending state

    Note:
        - Only one pending snapshot per epoch
        - Must be called during allocation window
        - Persists all calculated data
    """

    # Making snapshot outside of the allocation window does nothing
    pending_epoch_number = await epochs_contracts.get_pending_epoch()
    if pending_epoch_number is None:
        return None

    # We create only one snapshot per epoch (so we skip if it already exists)
    current_pending_snapshot = await get_pending_epoch_snapshot(
        session, pending_epoch_number
    )
    if current_pending_snapshot is not None:
        return None

    # Here we know that we should create a snapshot, so we get the epoch details
    epoch_details = await epochs_subgraph.fetch_epoch_by_number(pending_epoch_number)

    # For actual snapshot creation we assume that the end of the epoch is the current timestamp
    current_timestamp = epoch_details.fromTs + epoch_details.duration

    # Simulate = calculate the snapshot with the current state
    pending_snapshot = await simulate_pending_snapshot_v1(
        epochs_subgraph,
        deposit_events_repository,
        staking_proceeds_calc,
        epoch_number=pending_epoch_number,
        current_timestamp=current_timestamp,
    )

    # Persist the snapshot
    await save_deposits(session, pending_epoch_number, pending_snapshot.user_deposits)
    await save_budgets(session, pending_epoch_number, pending_snapshot.user_budgets)
    await save_pending_snapshot(session, pending_epoch_number, pending_snapshot.rewards)

    await session.commit()

    # Return response
    response.status_code = status.HTTP_201_CREATED
    return SnapshotCreatedResponseV1(epoch=pending_epoch_number)


@api.get("/finalized/simulate")
async def simulate_finalized_snapshot_v1(
    # Dependencies
    session: GetSession,
    projects_contracts: GetProjectsContracts,
    epochs_subgraph: GetEpochsSubgraph,
    matched_rewards_settings: GetMatchedRewardsSettings,
    # Parameters (injected as dependencies for simulation)
    epoch_number: GetPendingEpoch,
) -> FinalizedSnapshotResponseV1:
    """
    Simulates the finalized snapshot without saving any data.

    This endpoint calculates what the finalized snapshot would look like based on
    current allocation data. It's useful for previewing final reward distributions
    before actual snapshot creation.

    Prerequisites:
        - Must be in allocation window
        - Pending snapshot must exist

    Calculation Process:
    1. Calculate patron rewards
    2. Calculate matched rewards:
        - Based on locked ratio
        - Apply TR and IRE percentages
        - Consider patron rewards
    3. Calculate project rewards:
        - Apply capped quadratic funding
        - Calculate matched amounts
        - Sum allocated and matched rewards
    4. Calculate total withdrawals:
        - Sum user claimed rewards
        - Sum project donations
    5. Calculate leftover:
        - Consider PPF
        - Consider matched rewards
        - Consider total withdrawals
        - Consider staking proceeds
        - Consider operational costs
        - Consider community fund
    6. Generate merkle tree:
        - Include user claimed rewards
        - Include project rewards
        - Calculate merkle root

    Returns:
        FinalizedSnapshotResponseV1 containing:
            - patrons_rewards: Rewards for patron mode users
            - matched_rewards: Total matched rewards
            - projects_rewards: List of project rewards
            - user_rewards: List of user claimed rewards
            - total_withdrawals: Sum of all withdrawals
            - leftover: Unused rewards
            - merkle_root: Root of rewards merkle tree

    Note:
        - This is a simulation and doesn't persist any data
        - Requires pending snapshot to exist
        - Only available during allocation window
    """

    # We can only simulate if we are in the open allocation window
    if epoch_number is None:
        raise HTTPException(
            status_code=400, detail="Possible only in open allocation window"
        )

    # Something is wrong if we are in pending state and no pending snapshot
    pending_snapshot = await get_pending_epoch_snapshot(session, epoch_number)
    if pending_snapshot is None:
        raise HTTPException(
            status_code=400, detail="Pending snapshot is missing! We need it here"
        )

    # We need to to get the timestamp on which the epoch the finalized snapshot is created
    epoch_details = await epochs_subgraph.get_epoch_by_number(epoch_number)
    patron_rewards = await get_patrons_rewards(
        session, epoch_details.finalized_timestamp.datetime(), epoch_number
    )

    # Check if this epoch should reserve staking for v2
    reserve_staking = should_reserve_staking_for_v2(epoch_number)

    if reserve_staking:
        # Separate staking portion from patron rewards
        staking_matched_portion = calculate_staking_matched_rewards(
            staking_proceeds=int(pending_snapshot.eth_proceeds),
            locked_ratio=Decimal(pending_snapshot.locked_ratio),
            ire_percent=matched_rewards_settings.IRE_PERCENT,
            tr_percent=matched_rewards_settings.TR_PERCENT,
            matched_rewards_percent=matched_rewards_settings.MATCHED_REWARDS_PERCENT,
        )

        # Matched rewards for distribution = patron rewards ONLY
        matched_rewards = patron_rewards

        # Store the staking portion separately (will NOT be distributed)
        staking_matched_reserved = staking_matched_portion
    else:
        # Standard epochs: matched rewards include both staking + patron
        matched_rewards = _calculate_percentage_matched_rewards(
            locked_ratio=Decimal(pending_snapshot.locked_ratio),
            tr_percent=matched_rewards_settings.TR_PERCENT,
            ire_percent=matched_rewards_settings.IRE_PERCENT,
            staking_proceeds=int(pending_snapshot.eth_proceeds),
            patrons_rewards=patron_rewards,
            matched_rewards_percent=matched_rewards_settings.MATCHED_REWARDS_PERCENT,
        )
        staking_matched_reserved = 0  # No reservation for standard epochs

    # Let's actually calculate QF for all projects here
    all_allocations = await get_allocations_with_user_uqs(session, epoch_number)
    all_projects = await projects_contracts.get_project_addresses(epoch_number)
    funding = capped_quadratic_funding(
        all_allocations,
        matched_rewards,
        all_projects,
    )

    # How much each user took for themselves (non zero only)
    # How much was allocated towards projects
    # How much was distributed in total
    user_claimed_rewards = await get_all_users_claimed_rewards(session, epoch_number)
    claimed_rewards_sum = sum(user_claimed_rewards.values())
    donated_to_projects = (
        funding.allocations_total_for_all_projects
        + funding.matched_total_for_all_projects
    )
    total_withdrawals = claimed_rewards_sum + int(donated_to_projects)

    # Calculate base leftover
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

    # For reserve epochs, add back the reserved staking portion (it's leftover since not distributed)
    if reserve_staking:
        leftover += staking_matched_reserved

    # Building merkle root for rewards validation
    LEAF_ENCODING: list[str] = ["address", "uint256"]
    mr_values = [
        [address, amount] for address, amount in user_claimed_rewards.items()
    ] + [
        [address, funding.allocated + funding.matched]
        for address, funding in funding.project_fundings.items()
        if funding.allocated > 0
    ]
    if len(mr_values) > 0:
        merkle_tree = StandardMerkleTree.of(mr_values, LEAF_ENCODING)
        merkle_root = merkle_tree.root
    else:
        merkle_root = None

    # Returning the snapshot simulation response
    return FinalizedSnapshotResponseV1(
        patrons_rewards=patron_rewards,
        matched_rewards=matched_rewards,
        projects_rewards=[
            ProjectRewardsV1(
                address=address,
                amount=funding.allocated + funding.matched,  # or + matched?
                matched=funding.matched,
            )
            for address, funding in funding.project_fundings.items()
            if funding.allocated > 0
        ],
        user_rewards=[
            UserRewardsV1(
                address=address,
                amount=amount,
            )
            for address, amount in user_claimed_rewards.items()
        ],
        total_withdrawals=total_withdrawals,
        leftover=leftover,
        merkle_root=merkle_root,
        staking_matched_reserved_for_v2=staking_matched_reserved,
    )


@api.post("/finalized")
async def create_finalized_snapshot_v1(
    response: Response,
    # Dependencies
    session: GetSession,
    epochs_contracts: GetEpochsContracts,
    epochs_subgraph: GetEpochsSubgraph,
    projects_contracts: GetProjectsContracts,
    matched_rewards_settings: GetMatchedRewardsSettings,
) -> SnapshotCreatedResponseV1 | None:
    """
    Creates a finalized snapshot for the recently completed allocation window.

    This endpoint should be called at the end of the allocation window to finalize
    reward distributions. It creates a snapshot of the final allocation state
    and calculates all reward distributions.
    Saves to the database:
        - Project rewards
        - User rewards
        - Finalized snapshot

    On mainnet:
        - We call this endpoint at the end of the allocation window manually.
        - We can also run epoch verifier to check the discrepancy between the snapshot values and expected values.
        - Because of floating point precision issues we might have some small discrepancies between the snapshot values and expected values.
    On testnets:
        - We have a cron job that calls this endpoint every minute so this will happen automatically.

    Prerequisites:
        - Epoch must be in finalized state
        - Pending snapshot must exist
        - No finalized snapshot must exist

    Process:
    1. Verify epoch is in finalized state
    2. Check pending snapshot exists
    3. Check no finalized snapshot exists
    4. Calculate snapshot using simulation
    5. Persist results:
        - Save project rewards
        - Save user rewards
        - Save final snapshot data

    Returns:
        - 201: Snapshot created successfully
        - 200: Snapshot already exists
        - None: Epoch not in finalized state

    Note:
        - Only one finalized snapshot per epoch
        - Must be called after allocation window
        - Persists all calculated data
    """

    # We can only create a snapshot if we are in the finalized state
    finalized_epoch_number = await epochs_contracts.get_finalized_epoch()
    if finalized_epoch_number is None:
        return None

    # We need to have a pending snapshot for the epoch already computed (and saved)
    # But when we have a finalized snapshot we don't recompute it again
    pending_snapshot = await get_pending_epoch_snapshot(session, finalized_epoch_number)
    current_finalized_snapshot = await get_finalized_epoch_snapshot(
        session, finalized_epoch_number
    )
    if current_finalized_snapshot is not None or pending_snapshot is None:
        return None

    # Simulate the snapshot
    finalized_snapshot = await simulate_finalized_snapshot_v1(
        session,
        projects_contracts,
        epochs_subgraph,
        matched_rewards_settings,
        epoch_number=finalized_epoch_number,
    )

    # Save snapshot results to the database
    await save_rewards(
        session,
        finalized_epoch_number,
        finalized_snapshot.projects_rewards,
        finalized_snapshot.user_rewards,
    )
    await save_finalized_snapshot(session, finalized_epoch_number, finalized_snapshot)

    await session.commit()

    # When we actually create a snapshot we return 201 with the epoch number
    response.status_code = status.HTTP_201_CREATED
    return SnapshotCreatedResponseV1(epoch=finalized_epoch_number)


@api.get("/status/{epoch}")
async def get_snapshot_status_v1(
    session: GetSession,
    epochs_contracts: GetEpochsContracts,
    epoch: int,
) -> EpochStatusResponseV1:
    """
    Returns the status of a specific epoch's snapshots.

    This endpoint provides information about the state of snapshots for a given epoch,
    indicating whether it's current, pending, or finalized.

    Path Parameters:
        - epoch: The epoch number to check

    Returns:
        EpochStatusResponseV1 containing:
            - is_current: Whether epoch is currently active
            - is_pending: Whether epoch has pending snapshot
            - is_finalized: Whether epoch has finalized snapshot

    Note:
        - Future epochs raise EpochNotStartedYet
        - Invalid epochs raise InvalidEpoch
        - Finalized status requires snapshot to exist
        - Pending status requires snapshot to exist
    """
    current = await epochs_contracts.get_current_epoch()
    pending = await epochs_contracts.get_pending_epoch()
    finalized = await epochs_contracts.get_finalized_epoch()

    # We might already have a finalized snapshot for this epoch
    if epoch <= finalized:
        finalized_snapshot = await get_finalized_epoch_snapshot(session, epoch)
        return EpochStatusResponseV1(
            is_current=False,
            is_pending=False,
            is_finalized=finalized_snapshot is not None,
        )

    # We are in the future (and definitely not finalized)
    if epoch > current:
        raise exceptions.EpochNotStartedYet

    # We are in the current epoch so not finalized
    if epoch == current:
        return EpochStatusResponseV1(
            is_current=True,
            is_pending=False,
            is_finalized=False,
        )

    # Not current and not finalized but might be pending
    if epoch == pending:
        pending_snapshot = await get_pending_epoch_snapshot(session, epoch)
        return EpochStatusResponseV1(
            is_current=False,
            is_pending=pending_snapshot is not None,
            is_finalized=False,
        )

    raise exceptions.InvalidEpoch()

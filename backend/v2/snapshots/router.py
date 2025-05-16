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
from v2.matched_rewards.services import _calculate_percentage_matched_rewards
from v2.project_rewards.capped_quadratic import capped_quadratic_funding
from v2.project_rewards.repositories import save_rewards
from v2.project_rewards.services import (
    calculate_effective_deposits,
    calculate_octant_rewards,
)
from v2.projects.dependencies import GetProjectsContracts
from v2.snapshots.services import calculate_leftover
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
    Simulates the pending snapshot (does not save anything)

    When simulating we use the current epoch number to get the epoch details
    and then assume that the current timestamp is the end of the epoch.
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
    Take a database snapshot of the recently completed epoch.
    This endpoint should be executed at the beginning of an epoch to activate
    a decision window.

    If the epoch is not pending, this endpoint will return None.

    Status codes:
        200: Snapshot could not be created due to an existing snapshot for previous epoch.
        201: Snapshot created successfully.
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
    Simulates the finalized snapshot (does not save anything)

    Finalized snapshot can be created only in the open allocation window.
    We also need to have a pending snapshot for the epoch already computed (and saved)
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

    # Building merkle root for rewards validation
    LEAF_ENCODING: list[str] = ["address", "uint256"]
    mr_values = [
        [address, amount] for address, amount in user_claimed_rewards.items()
    ] + [
        [address, funding.allocated + funding.matched]
        for address, funding in funding.project_fundings.items()
    ]
    merkle_tree = StandardMerkleTree.of(mr_values, LEAF_ENCODING)
    merkle_root = merkle_tree.root

    # Returning the snaphost simulation response
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
    Take a database snapshot of the recenlty completed allocations.
    This endpoint should be executed at the end of the decision window.

    Status codes:
        200: Snapshot could not be created due to an existing snapshot for previous epoch
        201: Snapshot created successfully.
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
    Returns the status of the given epoch: current, pending, or finalized.
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

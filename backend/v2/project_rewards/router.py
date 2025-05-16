from fastapi import APIRouter, Response, status
from app.context.epoch_state import EpochState
from app.exceptions import (
    InvalidEpoch,
    MissingSnapshot,
    NotImplementedForGivenEpochState,
)
from app.engine.user.budget.with_ppf import UserBudgetWithPPF
from app.modules.snapshots.pending.core import calculate_user_budgets
from app.modules.staking.proceeds.core import estimate_staking_proceeds
from v2.matched_rewards.dependencies import (
    GetMatchedRewardsEstimator,
)
from v2.deposits.dependencies import GetDepositEventsRepository
from v2.glms.dependencies import GetGLMBalanceOfDeposits
from v2.allocations.repositories import (
    get_donors_for_epoch,
    sum_allocations_by_epoch,
)
from v2.core.types import Address
from v2.snapshots.repositories import get_finalized_epoch_snapshot
from v2.epochs.dependencies import (
    GetEpochsContracts,
    GetEpochsSubgraph,
    get_epoch_state,
)
from v2.project_rewards.repositories import get_rewards_for_projects_in_epoch
from v2.projects.dependencies import (
    GetProjectsAllocationThresholdGetter,
    GetProjectsContracts,
)
from v2.user_patron_mode.repositories import (
    get_all_patrons_at_timestamp,
    get_all_users_budgets_by_epoch,
    get_budget_by_user_address_and_epoch,
)
from v2.core.dependencies import GetCurrentTimestamp, GetSession
from v2.project_rewards.services import (
    calculate_effective_deposits,
    calculate_octant_rewards,
    calculate_user_budget,
    get_rewards_merkle_tree_for_epoch,
    simulate_user_effective_deposits,
)
from v2.project_rewards.dependencies import GetProjectRewardsEstimator
from v2.project_rewards.schemas import (
    EpochBudgetItemV1,
    EpochBudgetsResponseV1,
    EstimatedBudgetByDaysRequestV1,
    EstimatedBudgetByEpochRequestV1,
    EstimatedProjectRewardsResponseV1,
    ProjectFundingSummaryV1,
    RewardsLeverageResponseV1,
    RewardsMerkleTreeResponseV1,
    ThresholdResponseV1,
    UnusedRewardsResponseV1,
    UpcomingUserBudgetResponseV1,
    UserBudgetResponseV1,
    UserBudgetWithMatchedFundingResponseV1,
)

api = APIRouter(prefix="/rewards", tags=["Rewards"])


@api.get("/budget/{user_address}/epoch/{epoch_number}")
async def get_user_budget_for_epoch_v1(
    session: GetSession,
    user_address: Address,
    epoch_number: int,
    response: Response,
) -> UserBudgetResponseV1 | None:
    """
    Returns user's rewards budget available to allocate for given epoch.
    Returns 204 No Content if user does not have budget for given epoch.
    """
    budget = await get_budget_by_user_address_and_epoch(
        session,
        user_address,
        epoch_number,
    )

    if budget is None:
        response.status_code = status.HTTP_204_NO_CONTENT
        return None

    return UserBudgetResponseV1(budget=budget)


@api.get("/budget/{user_address}/upcoming")
async def get_user_budget_for_upcoming_epoch_v1(
    # Dependencies
    epochs_contracts: GetEpochsContracts,
    epochs_subgraph: GetEpochsSubgraph,
    deposit_events_repository: GetDepositEventsRepository,
    current_timestamp: GetCurrentTimestamp,
    # Parameters
    user_address: Address,
) -> UpcomingUserBudgetResponseV1:
    """
    Returns the upcoming user budget based on as-if allocation happened now.

    This is done by simulating the epoch end as if it ended now.
    So we simulate the pending snapshot for this epoch end.
     - Get current epoch details
     - Simulate the epoch end as if it ended now (end_time = now)
     - Simulate the pending snapshot for this epoch end
        - Estimate staking proceeds
        - Calculate total effective deposit based on deposit events
        - Calculate octant rewards
     - Calculate the user budget for this pending snapshot
    """

    # Get current epoch details
    epoch_number = await epochs_contracts.get_current_epoch()
    epoch_details = await epochs_subgraph.fetch_epoch_by_number(epoch_number)

    # We SIMULATE the epoch end as if it ended now
    epoch_end = current_timestamp
    epoch_start = epoch_details.fromTs

    # BEGIN: Calculate pending snapshot
    eth_proceeds = estimate_staking_proceeds(epoch_end - epoch_start)
    # Based on all deposit events, calculate effective deposits
    events = await deposit_events_repository.get_all_users_events(
        epoch_number, epoch_start, epoch_end
    )
    user_deposits, total_effective_deposit = calculate_effective_deposits(
        epoch_start, epoch_end, events
    )

    # Calculate octant rewards
    rewards = calculate_octant_rewards(eth_proceeds, total_effective_deposit)

    # END: Calculate pending snapshot

    # Calculate user budget
    user_budget_calculator = UserBudgetWithPPF()
    user_budgets = calculate_user_budgets(
        user_budget_calculator, rewards, user_deposits
    )
    user_budget = next(
        (
            budget.budget
            for budget in user_budgets
            if budget.user_address == user_address
        ),
        0,  # Default value if user not found
    )

    return UpcomingUserBudgetResponseV1(upcoming_budget=user_budget)


@api.get("/budgets/epoch/{epoch_number}")
async def get_epoch_budgets_v1(
    session: GetSession,
    epoch_number: int,
) -> EpochBudgetsResponseV1:
    """
    Returns all users rewards budgets for the epoch.
    """
    budgets = await get_all_users_budgets_by_epoch(session, epoch_number)

    return EpochBudgetsResponseV1(
        budgets=[
            EpochBudgetItemV1(address=address, amount=amount)
            for address, amount in budgets.items()
        ]
    )


@api.post("/estimated_budget")
async def get_estimated_budget_v1(
    session: GetSession,
    epoch_contracts: GetEpochsContracts,
    # Parameters
    glm_balance: GetGLMBalanceOfDeposits,
    request: EstimatedBudgetByEpochRequestV1,
) -> UserBudgetWithMatchedFundingResponseV1:
    """
    Returns the estimated budget if the user deposits GLMs for a given number of FULL epochs.
    Each epoch is a 90 day period.

    This is done based on the last finalized snapshot.
    - Get the last finalized epoch
    - Calculate the leverage based on the last finalized epoch
    - Get the future epoch details (start_time, duration, end_time)
    - Calculate rewards:
        - Estimate staking proceeds
        - Assume total effective deposit as total GLMs from contract
        - Calculate octant rewards
    - Simulate user events as if they deposited given amount of GLMs
    - Calculate user budget for this pending snapshot
    """

    future_epoch = await epoch_contracts.get_future_epoch_props()
    epoch_start = future_epoch[2]
    epoch_duration = future_epoch[3]
    epoch_end = epoch_start + epoch_duration
    epoch_remaining = epoch_duration

    # We interpolate future rewards based on the future epoch
    #  duration and total effective deposit of the finalized epoch
    eth_proceeds = estimate_staking_proceeds(epoch_duration)
    total_effective_deposit = glm_balance
    future_rewards = calculate_octant_rewards(eth_proceeds, total_effective_deposit)

    # Simulate budget
    user_effective_deposit = simulate_user_effective_deposits(
        epoch_start,
        epoch_end,
        epoch_remaining,
        epoch_duration,
        request.glm_amount,
    )
    user_budget = calculate_user_budget(
        user_effective_deposit,
        future_rewards,
    )

    epochs_budget = request.number_of_epochs * user_budget

    # Matching fund is calculated based on the last epoch's leverage
    epoch_number = await epoch_contracts.get_finalized_epoch()

    # Calculate the leverage based on the last finalized epoch
    finalized_snapshot = await get_finalized_epoch_snapshot(session, epoch_number)
    if finalized_snapshot is None:
        raise MissingSnapshot()
    matched_rewards = int(finalized_snapshot.matched_rewards)

    allocations_sum = await sum_allocations_by_epoch(session, epoch_number)
    leverage = matched_rewards / allocations_sum if allocations_sum else 0

    return UserBudgetWithMatchedFundingResponseV1(
        budget=epochs_budget,
        matched_funding=int(epochs_budget * leverage),
    )


@api.post("/estimated_budget/by_days")
async def get_estimated_budget_by_days_v1(
    epoch_contracts: GetEpochsContracts,
    epoch_subgraph: GetEpochsSubgraph,
    deposit_events: GetDepositEventsRepository,
    glm_balance: GetGLMBalanceOfDeposits,
    current_timestamp: GetCurrentTimestamp,
    request: EstimatedBudgetByDaysRequestV1,
) -> UserBudgetResponseV1:
    """
    Returns the estimated budget if the user deposits GLMs for a given number of days.

    This is done by first filling up the current epoch and then calculating the remaining budget for the future epochs.
    """

    remaining_lock_duration = request.lock_duration_sec

    # Get the current epoch details
    current_epoch_number = await epoch_contracts.get_current_epoch()
    current_epoch_details = await epoch_subgraph.fetch_epoch_by_number(
        current_epoch_number
    )
    current_epoch_start = current_epoch_details.fromTs
    current_epoch_duration = current_epoch_details.duration
    current_epoch_remaining = (
        current_epoch_start + current_epoch_duration - current_timestamp
    )

    # CURRENT EPOCH REWARDS
    current_eth_proceeds = estimate_staking_proceeds(current_epoch_duration)
    current_events = await deposit_events.get_all_users_events(
        current_epoch_number,
        current_epoch_start,
        current_epoch_start + current_epoch_duration,
    )
    _, total_effective_deposit = calculate_effective_deposits(
        current_epoch_start,
        current_epoch_start + current_epoch_duration,
        current_events,
    )

    current_rewards = calculate_octant_rewards(
        current_eth_proceeds, total_effective_deposit
    )

    # Simulate user budget till the end of the current epoch
    user_effective_deposit = simulate_user_effective_deposits(
        current_epoch_start,
        current_epoch_start + current_epoch_duration,
        current_epoch_remaining,
        remaining_lock_duration,
        request.glm_amount,
    )
    budget = calculate_user_budget(
        user_effective_deposit,
        current_rewards,
    )

    # Subtract the current epoch remaining from the remaining lock duration
    # If there's no remaining lock duration, we're done
    remaining_lock_duration -= current_epoch_remaining
    if remaining_lock_duration <= 0:
        return UserBudgetResponseV1(budget=budget)

    # FUTURE EPOCH REWARDS
    # Because we've already filled up the current epoch, we need to calculate based on the future epoch
    future_epoch_number = await epoch_contracts.get_future_epoch_props()
    future_epoch_start = future_epoch_number[2]
    future_epoch_duration = future_epoch_number[3]
    future_epoch_end = future_epoch_start + future_epoch_duration
    future_eth_proceeds = estimate_staking_proceeds(future_epoch_duration)

    future_total_effective_deposit = glm_balance
    future_rewards = calculate_octant_rewards(
        future_eth_proceeds, future_total_effective_deposit
    )

    # Calculate the number of full future epochs and the remaining lock duration
    full_epochs_num, remaining_future_epoch_sec = divmod(
        remaining_lock_duration, future_epoch_duration
    )

    # Simulate user budget for the full future epochs
    user_effective_deposit = simulate_user_effective_deposits(
        future_epoch_start,
        future_epoch_end,
        future_epoch_duration,
        future_epoch_duration,
        request.glm_amount,
    )
    budget += full_epochs_num * calculate_user_budget(
        user_effective_deposit,
        future_rewards,
    )

    if remaining_future_epoch_sec > 0:
        user_effective_deposit = simulate_user_effective_deposits(
            future_epoch_start,
            future_epoch_end,
            future_epoch_duration,
            remaining_future_epoch_sec,
            request.glm_amount,
        )
        budget += calculate_user_budget(
            user_effective_deposit,
            future_rewards,
        )

    return UserBudgetResponseV1(budget=budget)


@api.get("/leverage/{epoch_number}")
async def get_rewards_leverage_v1(
    session: GetSession,
    epochs_contracts: GetEpochsContracts,
    matched_rewards_estimator: GetMatchedRewardsEstimator,
    # Parameters
    epoch_number: int,
) -> RewardsLeverageResponseV1:
    """
    Returns leverage for a given epoch.

    For finalized epochs it returns the leverage based on the data from the finalized snapshot.
    For pending and finalizing epochs it returns the leverage based on the estimated matched rewards of pending epoch.
    """

    epoch_state = await get_epoch_state(session, epochs_contracts, epoch_number)

    # This operations only makes sense for finalized, finalizing and pending epochs
    if epoch_state > EpochState.PENDING:
        raise NotImplementedForGivenEpochState()

    # Figure out the matched rewards
    if epoch_state == EpochState.FINALIZED:
        # For finalized epoch matched_rewards is just taken from the finalized snapshot
        finalized_snapshot = await get_finalized_epoch_snapshot(session, epoch_number)
        if finalized_snapshot is None:
            raise MissingSnapshot()
        matched_rewards = int(finalized_snapshot.matched_rewards)

    else:
        # For pending or finalizing epoch matched_rewards is estimated based on current state of AW
        matched_rewards = await matched_rewards_estimator.get()

    allocations_sum = await sum_allocations_by_epoch(session, epoch_number)

    return RewardsLeverageResponseV1(
        leverage=matched_rewards / allocations_sum if allocations_sum else 0
    )


@api.get("/merkle_tree/{epoch_number}")
async def get_rewards_merkle_tree_v1(
    session: GetSession,
    epoch_number: int,
) -> RewardsMerkleTreeResponseV1:
    """
    Returns the rewards merkle tree for a given epoch.
    """

    tree = await get_rewards_merkle_tree_for_epoch(session, epoch_number)
    if tree is None:
        # TODO: this could be better :)
        raise InvalidEpoch()

    return tree


@api.get("/projects/estimated")
async def get_estimated_project_rewards_v1(
    project_rewards_estimator: GetProjectRewardsEstimator,
) -> EstimatedProjectRewardsResponseV1:
    """
    Returns foreach project current allocation sum and estimated matched rewards.

    This endpoint is available only while allocation window is open.
    """

    estimated_funding = await project_rewards_estimator.get()

    return EstimatedProjectRewardsResponseV1(
        rewards=[f for f in estimated_funding.project_fundings.values()]
    )


@api.get("/projects/epoch/{epoch_number}")
async def get_rewards_for_projects_in_epoch_v1(
    session: GetSession,
    projects_contracts: GetProjectsContracts,
    epoch_number: int,
) -> EstimatedProjectRewardsResponseV1:
    """
    Returns projects with matched rewards for a given finalized epoch.

    """

    # For epoch projects retrieve their rewards
    projects = await projects_contracts.get_project_addresses(epoch_number)
    rewards = await get_rewards_for_projects_in_epoch(session, epoch_number, projects)

    return EstimatedProjectRewardsResponseV1(
        rewards=[
            ProjectFundingSummaryV1(
                address=reward.address,
                allocated=int(reward.amount) - int(reward.matched),
                matched=int(reward.matched),
            )
            for reward in rewards
        ]
    )


@api.get("/threshold/{epoch_number}")
async def get_rewards_threshold_v1(
    projects_allocation_threshold_getter: GetProjectsAllocationThresholdGetter,
) -> ThresholdResponseV1:
    threshold = await projects_allocation_threshold_getter.get()

    return ThresholdResponseV1(threshold=threshold)


@api.get("/unused/{epoch_number}")
async def get_unused_rewards_v1(
    session: GetSession,
    epoch_subgraph: GetEpochsSubgraph,
    epoch_number: int,
) -> UnusedRewardsResponseV1:
    """
    Returns list of users who didn't use their rewards in an epoch and the total sum of all unused rewards.

    This is based on available budgets and excluding donors (users who have allocated funds) and patrons.
    """

    # All users budgets, donors and patrons for the epoch
    budgets = await get_all_users_budgets_by_epoch(session, epoch_number)
    donors = await get_donors_for_epoch(session, epoch_number)
    epoch_details = await epoch_subgraph.get_epoch_by_number(epoch_number)
    patrons = await get_all_patrons_at_timestamp(
        session, epoch_details.finalized_timestamp.datetime()
    )

    # Exclude donors and patrons from the list of users who didn't use their rewards
    unused_budgets = {
        address: budget
        for address, budget in budgets.items()
        if address not in set(donors + patrons)
    }

    return UnusedRewardsResponseV1(
        addresses=sorted(list(unused_budgets.keys())),
        value=sum(unused_budgets.values()),
    )

"""
Project rewards management endpoints for handling reward calculations, distributions, and estimations.

This module provides endpoints for managing project rewards, including:
1. User budget calculations and estimations
2. Project reward distributions
3. Leverage calculations
4. Merkle tree generation for rewards
5. Threshold management

Key Concepts:
    - Rewards Budget:
        - User's available rewards for allocation
        - Calculated based on effective deposits
        - Can be estimated for future epochs
        - Can be estimated for specific lock durations

    - Project Rewards:
        - Matched rewards based on allocations
        - Calculated using leverage
        - Distributed via merkle tree
        - Subject to allocation thresholds

    - Leverage:
        - Ratio of matched rewards to total allocations
        - Different for finalized vs pending epochs
        - Used to estimate future rewards

    - Merkle Tree:
        - Used for efficient reward distribution
        - Generated for finalized epochs
        - Contains proof of rewards for each project

    - Thresholds:
        - Minimum allocation requirements
        - Used to determine project eligibility
        - Can vary by epoch
"""
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

    This endpoint retrieves the user's available budget for a specific epoch.
    The budget represents the amount of rewards the user can allocate to projects.

    Path Parameters:
        - user_address: The Ethereum address of the user
        - epoch_number: The epoch number to get budget for

    Returns:
        - UserBudgetResponseV1 containing the budget amount
        - 204 No Content if user has no budget for the epoch

    Note:
        - Budget is based on user's effective deposits
        - Only returns budget for past or current epochs
        - Returns None if user has no budget
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

    This endpoint simulates the current epoch's end to calculate what the user's
    budget would be if the epoch ended now. This is useful for users to estimate
    their potential rewards before the epoch actually ends.

    The calculation process:
    1. Get current epoch details
    2. Simulate epoch end as if it ended now
    3. Calculate pending snapshot:
        - Estimate staking proceeds
        - Calculate total effective deposits
        - Calculate octant rewards
    4. Calculate user budget based on their deposits

    Path Parameters:
        - user_address: The Ethereum address of the user

    Returns:
        UpcomingUserBudgetResponseV1 containing:
            - upcoming_budget: The estimated budget amount

    Note:
        - This is a simulation and actual rewards may differ
        - Based on current state of deposits and staking proceeds
        - Does not account for future changes in deposits
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

    This endpoint retrieves the budget information for all users in a specific epoch.
    Useful for analyzing the distribution of rewards across all participants.

    Path Parameters:
        - epoch_number: The epoch number to get budgets for

    Returns:
        EpochBudgetsResponseV1 containing:
            - budgets: List of EpochBudgetItemV1 objects, each with:
                - address: User's Ethereum address
                - amount: User's budget amount

    Note:
        - Includes all users with a budget in the epoch
        - Budgets are based on effective deposits
        - Order of budgets is not guaranteed
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

    This endpoint calculates the estimated rewards a user would receive if they
    deposited a specific amount of GLMs for a given number of epochs. Each epoch
    is a 90-day period.

    The difference between this endpoint and the `get_estimated_budget_by_days_v1` endpoint is that this endpoint
    calculates the estimated budget for a given number of FULL FUTURE epochs, while the `get_estimated_budget_by_days_v1`
    endpoint calculates the estimated budget for a given number of days starting from now and passing through to the future epochs.

    Calculation process:
    1. Get future epoch details (start time, duration)
    2. Calculate rewards:
        - Estimate staking proceeds
        - Use total GLMs from contract as effective deposit
        - Calculate octant rewards
    3. Simulate user deposits
    4. Calculate user budget
    5. Calculate matched funding based on last epoch's leverage

    Request Body:
        - glm_amount: Amount of GLMs to simulate depositing
        - number_of_epochs: Number of full epochs to simulate

    Returns:
        UserBudgetWithMatchedFundingResponseV1 containing:
            - budget: Total estimated budget
            - matched_funding: Estimated matched funding

    Note:
        - Based on last finalized epoch's leverage
        - Assumes full epoch participation
        - Does not account for future changes in staking proceeds
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

    This endpoint calculates the estimated rewards for a specific lock duration,
    taking into account both the current epoch and future epochs.

    Calculation process:
    1. Calculate current epoch rewards:
        - Get current epoch details
        - Calculate remaining time
        - Estimate staking proceeds
        - Calculate effective deposits
    2. Calculate future epoch rewards:
        - Get future epoch details
        - Calculate full epochs and remaining time
        - Estimate staking proceeds
        - Calculate effective deposits
    3. Combine rewards from both periods

    The difference between this endpoint and the `get_estimated_budget_by_days_v1` endpoint is that this endpoint
    calculates the estimated budget for a given number of FULL FUTURE epochs, while the `get_estimated_budget_by_days_v1`
    endpoint calculates the estimated budget for a given number of days starting from now and passing through to the future epochs.

    Request Body:
        - glm_amount: Amount of GLMs to simulate depositing
        - lock_duration_sec: Duration of lock in seconds

    Returns:
        UserBudgetResponseV1 containing:
            - budget: Total estimated budget

    Note:
        - Accounts for partial epoch participation (starts counting from the current epoch)
        - Based on current state of deposits
        - Does not account for future changes in staking proceeds
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

    This endpoint calculates the leverage ratio for a specific epoch. The leverage
    represents the ratio of matched rewards to total allocations.

    For different epoch states:
        - Finalized epochs: Uses data from finalized snapshot
        - Pending/Finalizing epochs: Uses estimated matched rewards

    Path Parameters:
        - epoch_number: The epoch number to get leverage for

    Returns:
        RewardsLeverageResponseV1 containing:
            - leverage: The calculated leverage ratio

    Note:
        - Only available for finalized, finalizing, and pending epochs
        - Returns 0 if no allocations exist
        - Different calculation methods based on epoch state
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

    This endpoint generates a merkle tree containing the reward proofs for all
    projects in a finalized epoch. The merkle tree is used for efficient and
    verifiable reward distribution.

    Path Parameters:
        - epoch_number: The epoch number to get merkle tree for

    Returns:
        RewardsMerkleTreeResponseV1 containing the merkle tree data

    Note:
        - Only available for finalized epochs
        - Used for on-chain reward distribution
        - Contains proofs for all project rewards
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

    This endpoint provides real-time estimates of project rewards during the
    allocation window. It shows both the current allocation sum and the estimated
    matched rewards for each project.

    This is the same info that is propagated to all clients after any allocation via WebSocket API.

    Returns:
        EstimatedProjectRewardsResponseV1 containing:
            - rewards: List of project funding summaries, each with:
                - address: Project address
                - allocated: Current allocation sum
                - matched: Estimated matched rewards

    Note:
        - Only available during allocation window
        - Estimates are based on current state
        - May change as more allocations are made
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

    This endpoint retrieves the final reward distribution for all projects in a
    finalized epoch, showing both allocated and matched amounts.

    Path Parameters:
        - epoch_number: The epoch number to get rewards for

    Returns:
        EstimatedProjectRewardsResponseV1 containing:
            - rewards: List of project funding summaries, each with:
                - address: Project address
                - allocated: Total allocated amount
                - matched: Total matched rewards

    Note:
        - Only available for finalized epochs
        - Shows final reward distribution
        - Includes all projects that received allocations
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
    """
    Returns the current allocation threshold for projects.

    This endpoint retrieves the minimum allocation threshold that projects must
    meet to be eligible for rewards in the current epoch.

    Returns:
        ThresholdResponseV1 containing:
            - threshold: The current allocation threshold

    Note:
        - Threshold can vary by epoch
        - Projects must meet threshold to receive rewards
        - Used to ensure meaningful project participation
    """
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

    This endpoint identifies users who had a budget but did not make any allocations
    during the epoch, excluding donors and patrons.

    Allocation request with all projects amounts equal to 0 is considered as using
    all the rewards but user withdraws all the rewards for themselves.

    Path Parameters:
        - epoch_number: The epoch number to check for unused rewards

    Returns:
        UnusedRewardsResponseV1 containing:
            - addresses: List of user addresses with unused rewards
            - value: Total sum of unused rewards

    Note:
        - Excludes users who made allocations (donors)
        - Excludes users in patron mode
        - Sorted list of addresses
        - Total value is sum of all unused budgets
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

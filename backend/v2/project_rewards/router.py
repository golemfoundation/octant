from datetime import datetime, time, timezone
import os
from fastapi import APIRouter, Response, status
import json
from app.context.epoch_state import EpochState
from app.exceptions import NotImplementedForGivenEpochState
from app.constants import SABLIER_SENDER_ADDRESS_SEPOLIA, SABLIER_TOKEN_ADDRESS_SEPOLIA, ZERO_ADDRESS
from app.infrastructure import SubgraphEndpoints
from app.engine.user.budget import UserBudgetPayload
from app.engine.user.budget.with_ppf import UserBudgetWithPPF
from app.engine.octant_rewards import OctantRewardsSettings
from app.modules.dto import OctantRewardsDTO, PendingSnapshotDTO
from app.modules.octant_rewards.core import calculate_rewards
from app.modules.snapshots.pending.core import calculate_user_budgets
from app.modules.staking.proceeds.core import estimate_staking_proceeds
from v2.deposits.dependencies import GetDepositEventsRepository
from v2.sablier.dependencies import GetSablierSubgraph
from v2.glms.dependencies import GetGLMBalanceOfDeposits, GetGLMContracts
from v2.sablier.subgraphs import SablierSubgraph
from v2.project_rewards.user_events import calculate_effective_deposits, calculate_pending_epoch_snapshot, simulate_user_events
from v2.allocations.repositories import (
    get_donors_for_epoch,
    sum_allocations_by_epoch,
)
from v2.core.types import Address
from v2.epoch_snapshots.repositories import get_finalized_epoch_snapshot
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
from v2.core.dependencies import GetSession
from v2.project_rewards.services import get_rewards_merkle_tree_for_epoch
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

    if not budget:
        response.status_code = status.HTTP_204_NO_CONTENT
        return None

    return UserBudgetResponseV1(budget=budget)


@api.get("/budget/{user_address}/upcoming")
async def get_user_budget_for_upcoming_epoch_v1(
    session: GetSession,
    epoch_contracts: GetEpochsContracts,
    epoch_subgraph: GetEpochsSubgraph,
    deposit_events: GetDepositEventsRepository,
    user_address: Address,
) -> UpcomingUserBudgetResponseV1:
    """
    Returns the upcoming user budget based on if allocation happened now.
    """

    epoch_number = await epoch_contracts.get_current_epoch()
    epoch_details = await epoch_subgraph.fetch_epoch_by_number(epoch_number)
    
    # We SIMULATE the epoch end as if it ended now
    epoch_end = int(datetime.now(timezone.utc).timestamp())
    epoch_start = epoch_details.fromTs

    # pending_snapshot = await calculate_pending_epoch_snapshot(
    #     deposit_events,
    #     epoch_number, 
    #     epoch_start, 
    #     epoch_end
    # )
# async def calculate_pending_epoch_snapshot(
#     deposit_events: DepositEventsRepository,
#     epoch_number: int,
#     epoch_start: int,
#     epoch_end: int,
# ) -> PendingSnapshotDTO:
    
    # Get octant rewards
        # epoch_details = await epochs_subgraph.fetch_epoch_by_number(epoch_number)
    # duration_sec = epoch_details.duration
    # return estimate_staking_proceeds(duration_sec)
    # eth_proceeds = await get_staking_proceeds(session, epoch_number, start_sec, end_sec)
    eth_proceeds = estimate_staking_proceeds(epoch_end - epoch_start)

    events = await deposit_events.get_all_users_events(
        epoch_number,
        epoch_start,
        epoch_end
    )
    user_deposits, total_effective_deposit = calculate_effective_deposits(epoch_start, epoch_end, events)

    # total_effective_deposit = 155654569757136462439580980
    rewards_settings = OctantRewardsSettings()
    octant_rewards = calculate_rewards(
        rewards_settings, eth_proceeds, total_effective_deposit
    )
    rewards = OctantRewardsDTO(
        staking_proceeds=eth_proceeds,
        locked_ratio=octant_rewards.locked_ratio,
        total_effective_deposit=total_effective_deposit,
        total_rewards=octant_rewards.total_rewards,
        vanilla_individual_rewards=octant_rewards.vanilla_individual_rewards,
        operational_cost=octant_rewards.operational_cost,
        ppf=octant_rewards.ppf_value,
        community_fund=octant_rewards.community_fund,
    )

    # events = await get_all_user_events(
    #     session,
    #     epochs_subgraph,
    #     sablier,
    #     epoch_number,
    #     epoch_start,
    #     epoch_end
    # )
    # user_deposits, total_effective_deposit = calculate_effective_deposits(epoch_start, epoch_end, events)

    user_budget_calculator = UserBudgetWithPPF()
    user_budgets = calculate_user_budgets(
        user_budget_calculator, rewards, user_deposits
    )
    # pending_snapshot = PendingSnapshotDTO(
    #     rewards=rewards, user_deposits=user_deposits, user_budgets=user_budgets
    # )
    # return PendingSnapshotDTO(
    #     rewards=rewards, user_deposits=user_deposits, user_budgets=user_budgets
    # )


# Getting unlocks in timestamp range 1728835200 - 1735308472
    # upcoming_budget = pending_snapshot.user_budgets.get(user_address)

    # print("Pending snapshot", pending_snapshot)

    user_budget = next(
        (budget.budget for budget in user_budgets if budget.user_address == user_address),
        0  # Default value if user not found
    )

    # if not user_budget:
    #     return UpcomingUserBudgetResponseV1(upcoming_budget=0)
    
    return UpcomingUserBudgetResponseV1(upcoming_budget=user_budget)
    print("I'm here")

    # TODO we need to handle snapshots here unfortunatelly
    # upcoming_budget = await get_upcoming_user_budget(user_address)



    # context = state_context(EpochState.SIMULATED, with_block_range=True)
    # service: UpcomingUserBudgets = get_services(EpochState.CURRENT).user_budgets_service
    # return service.get_budget(context, user_address)

    # def get_budget(self, context: Context, user_address: str) -> int:
        # simulated_snapshot = (
        #     self.simulated_pending_snapshot_service.simulate_pending_epoch_snapshot(
        #         context
        #     )
        # )
        # upcoming_budget = core.get_upcoming_budget(
        #     user_address, simulated_snapshot.user_budgets
        # )

        # return upcoming_budget


    # user_deposits = CalculatedUserDeposits(
    #         events_generator=DbAndGraphEventsGenerator()
    #     )
    # octant_rewards = CalculatedOctantRewards(
    #     staking_proceeds=EstimatedStakingProceeds(),
    #     effective_deposits=user_deposits,
    # )
    # UpcomingUserBudgets(
    #     simulated_pending_snapshot_service=SimulatedPendingSnapshots(
    #         effective_deposits=user_deposits, octant_rewards=octant_rewards
    #     )
    # )



    # simulated_snapshot = (
    #     self.simulated_pending_snapshot_service.simulate_pending_epoch_snapshot(
    #         context
    #     )
    # )

    # def _calculate_pending_epoch_snapshot(self, context: Context) -> PendingSnapshotDTO:
    # rewards = self.octant_rewards.get_octant_rewards(context)

        # def get_octant_rewards(self, context: Context) -> OctantRewardsDTO:
        #     eth_proceeds = self.staking_proceeds.get_staking_proceeds(context)
            # def get_staking_proceeds(self, context: Context) -> int:
            #     return estimate_staking_proceeds(context.epoch_details.duration_sec)

                # epoch_details = await epochs_subgraph.fetch_epoch_by_number(epoch_number)
                # duration_sec = epoch_details.duration
                # return estimate_staking_proceeds(duration_sec)

    #     total_effective_deposit = self.effective_deposits.get_total_effective_deposit(
    #         context
    #     )
        # def get_total_effective_deposit(self, context: Context) -> int:
        #    events = self.events_generator.get_all_users_events(context)
        #    _, total = calculate_effective_deposits(
        #        context.epoch_details, context.epoch_settings, events
        #    )
        #    return total


    #     rewards_settings = context.epoch_settings.octant_rewards
    #     octant_rewards = calculate_rewards(
    #         rewards_settings, eth_proceeds, total_effective_deposit
    #     )
    #     (
    #         locked_ratio,
    #         total_rewards,
    #         vanilla_individual_rewards,
    #         op_cost,
    #         ppf,
    #         community_fund,
    #     ) = (
    #         octant_rewards.locked_ratio,
    #         octant_rewards.total_rewards,
    #         octant_rewards.vanilla_individual_rewards,
    #         octant_rewards.operational_cost,
    #         octant_rewards.ppf_value,
    #         octant_rewards.community_fund,
    #     )

    #     return OctantRewardsDTO(
    #         staking_proceeds=eth_proceeds,
    #         locked_ratio=locked_ratio,
    #         total_effective_deposit=total_effective_deposit,
    #         total_rewards=total_rewards,
    #         vanilla_individual_rewards=vanilla_individual_rewards,
    #         operational_cost=op_cost,
    #         ppf=ppf,
    #         community_fund=community_fund,
    #     )

    # (
    #     user_deposits,
    #     _,
    # ) = self.effective_deposits.get_all_effective_deposits(context)
    # user_budgets = calculate_user_budgets(
    #     context.epoch_settings.user.budget, rewards, user_deposits
    # )

    # return PendingSnapshotDTO(
    #     rewards=rewards, user_deposits=user_deposits, user_budgets=user_budgets
    # )

    # user_budget = next(
    #     filter(
    #         lambda budget_info: budget_info.user_address == user_address,
    #         upcoming_user_budgets,
    #     ),
    #     None,
    # )
    # if not user_budget:
    #     return 0
    # return user_budget.budget

    # upcoming_budget = core.get_upcoming_budget(
    #     user_address, simulated_snapshot.user_budgets
    # )

    # return upcoming_budget

    return UpcomingUserBudgetResponseV1(upcoming_budget=upcoming_budget)





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
    glm_balance: GetGLMBalanceOfDeposits,
    request: EstimatedBudgetByEpochRequestV1,
) -> UserBudgetWithMatchedFundingResponseV1:
    
    # leverage
    epoch_number = await epoch_contracts.get_finalized_epoch()
    
    # Calculate leverage based on the last finalized epoch
    allocations_sum = await sum_allocations_by_epoch(session, epoch_number)
    finalized_snapshot = await get_finalized_epoch_snapshot(session, epoch_number)
    matched_rewards = int(finalized_snapshot.matched_rewards)

    leverage = matched_rewards / allocations_sum if allocations_sum else 0

    future_epoch = await epoch_contracts.get_future_epoch_props()
    print("Future epoch", future_epoch)
    # start_sec = future_epoch[2]
    start_sec = future_epoch[2]
    # duration = future_epoch[3]
    duration = future_epoch[3]
    end_sec = start_sec + duration
    # decision_window = future_epoch[4]
    decision_window = future_epoch[4]

    # Estimate staking proceeds
    eth_proceeds = estimate_staking_proceeds(duration)
    total_effective_deposit = glm_balance

    # total_effective_deposit = 155654569757136462439580980
    rewards_settings = OctantRewardsSettings()
    octant_rewards = calculate_rewards(
        rewards_settings, eth_proceeds, total_effective_deposit
    )
    future_rewards = OctantRewardsDTO(
        staking_proceeds=eth_proceeds,
        locked_ratio=octant_rewards.locked_ratio,
        total_effective_deposit=total_effective_deposit,
        total_rewards=octant_rewards.total_rewards,
        vanilla_individual_rewards=octant_rewards.vanilla_individual_rewards,
        operational_cost=octant_rewards.operational_cost,
        ppf=octant_rewards.ppf_value,
        community_fund=octant_rewards.community_fund,
    )


    # Simulate user events as if they deposited given amount of GLMs
    events = {
        ZERO_ADDRESS: simulate_user_events(
            end_sec,
            duration,
            duration,
            request.glm_amount
        )
    }
    user_deposits, total_effective_deposit = calculate_effective_deposits(start_sec, end_sec, events)

    # print("total_effective_deposit", total_effective_deposit)
    # print("User deposits", user_deposits)
    effective_deposit = (
        user_deposits[0].effective_deposit if user_deposits else 0
    )

    # print("Effective deposit", effective_deposit)
    # print("Total effective deposit", future_rewards.total_effective_deposit)
    # print("Vanilla individual rewards", future_rewards.vanilla_individual_rewards)
    # print("PPF", future_rewards.ppf)

    budget_calculator = UserBudgetWithPPF()
    epoch_budget = budget_calculator.calculate_budget(
        UserBudgetPayload(
            user_effective_deposit=effective_deposit,
            total_effective_deposit=future_rewards.total_effective_deposit,
            vanilla_individual_rewards=future_rewards.vanilla_individual_rewards,
            ppf=future_rewards.ppf,
        )
    )
    epochs_budget = request.number_of_epochs * epoch_budget

    matching_fund = epochs_budget * leverage


    return UserBudgetWithMatchedFundingResponseV1(
        budget=epochs_budget,
        matched_funding=matching_fund
    )


def estimate_epoch_budget(
    start_sec: int, 
    end_sec: int,
    remaining_sec: int,
    lock_duration: int,
    glm_amount: int, 
    rewards: OctantRewardsDTO
) -> int:
    events = {
        ZERO_ADDRESS: simulate_user_events(
            end_sec,
            lock_duration,
            remaining_sec,
            glm_amount
        )
    }
    user_deposits, total_effective_deposit = calculate_effective_deposits(start_sec, end_sec, events)

    # print("total_effective_deposit", total_effective_deposit)
    # print("User deposits", user_deposits)
    effective_deposit = (
        user_deposits[0].effective_deposit if user_deposits else 0
    )

    # print("Effective deposit", effective_deposit)
    # print("Total effective deposit", future_rewards.total_effective_deposit)
    # print("Vanilla individual rewards", future_rewards.vanilla_individual_rewards)
    # print("PPF", future_rewards.ppf)

    budget_calculator = UserBudgetWithPPF()
    return budget_calculator.calculate_budget(
        UserBudgetPayload(
            user_effective_deposit=effective_deposit,
            total_effective_deposit=rewards.total_effective_deposit,
            vanilla_individual_rewards=rewards.vanilla_individual_rewards,
            ppf=rewards.ppf,
        )
    )


@api.post("/estimated_budget/by_days")
async def get_estimated_budget_by_days_v1(
    epoch_contracts: GetEpochsContracts,
    epoch_subgraph: GetEpochsSubgraph,
    deposit_events: GetDepositEventsRepository,
    glm_balance: GetGLMBalanceOfDeposits,
    request: EstimatedBudgetByDaysRequestV1,
) -> UserBudgetResponseV1:
    # validate_estimate_budget_inputs(days, glm_amount)

    lock_duration_sec = request.days * 86400 # 24hours * 60minutes * 60seconds

    current_epoch_number = await epoch_contracts.get_current_epoch()
    current_epoch_details = await epoch_subgraph.fetch_epoch_by_number(current_epoch_number)
    current_epoch_start = current_epoch_details.fromTs
    current_epoch_duration = current_epoch_details.duration
    current_epoch_remaining = current_epoch_start + current_epoch_duration - int(datetime.now().timestamp())

    # CURRENT EPOCH REWARDS
    current_eth_proceeds = estimate_staking_proceeds(current_epoch_duration)
    current_events = await deposit_events.get_all_users_events(
        current_epoch_number,
        current_epoch_start,
        current_epoch_start + current_epoch_duration
    )
    user_deposits, total_effective_deposit = calculate_effective_deposits(current_epoch_start, current_epoch_start + current_epoch_duration, current_events)

    current_rewards_settings = OctantRewardsSettings()
    current_octant_rewards = calculate_rewards(
        current_rewards_settings, current_eth_proceeds, total_effective_deposit
    )
    current_rewards = OctantRewardsDTO(
        staking_proceeds=current_eth_proceeds,
        locked_ratio=current_octant_rewards.locked_ratio,
        total_effective_deposit=total_effective_deposit,
        total_rewards=current_octant_rewards.total_rewards,
        vanilla_individual_rewards=current_octant_rewards.vanilla_individual_rewards,
        operational_cost=current_octant_rewards.operational_cost,
        ppf=current_octant_rewards.ppf_value,
        community_fund=current_octant_rewards.community_fund,
    )


    # return estimate_budget(lock_duration_sec, glm_amount)
    # current_context = state_context(EpochState.CURRENT)
    # current_rewards_service = get_services(EpochState.CURRENT).octant_rewards_service
        # CURRENT
        # is_mainnet = compare_blockchain_types(chain_id, ChainTypes.MAINNET)
            # octant_rewards = CalculatedOctantRewards(
            #     staking_proceeds=EstimatedStakingProceeds(),
            #     effective_deposits=CalculatedUserDeposits(
            #     events_generator=DbAndGraphEventsGenerator()
            # )
        # )


    # current_rewards = current_rewards_service.get_octant_rewards(current_context)

    # FUTURE EPOCH REWARDS
    future_epoch_number = await epoch_contracts.get_future_epoch_props()
    future_epoch_start = future_epoch_number[2]
    future_epoch_duration = future_epoch_number[3]
    future_epoch_end = future_epoch_start + future_epoch_duration
    future_eth_proceeds = estimate_staking_proceeds(future_epoch_duration)

    future_total_effective_deposit = glm_balance

    future_rewards_settings = OctantRewardsSettings()
    future_octant_rewards = calculate_rewards(
        future_rewards_settings, future_eth_proceeds, future_total_effective_deposit
    )
    future_rewards = OctantRewardsDTO(
        staking_proceeds=future_eth_proceeds,
        locked_ratio=future_octant_rewards.locked_ratio,
        total_effective_deposit=future_total_effective_deposit,
        total_rewards=future_octant_rewards.total_rewards,
        vanilla_individual_rewards=future_octant_rewards.vanilla_individual_rewards,
        operational_cost=future_octant_rewards.operational_cost,
        ppf=future_octant_rewards.ppf_value,
        community_fund=future_octant_rewards.community_fund,
    )

    # future_context = state_context(EpochState.FUTURE)
    # future_rewards_service = get_services(EpochState.FUTURE).octant_rewards_service
        # octant_rewards_service=CalculatedOctantRewards(
        #     staking_proceeds=EstimatedStakingProceeds(),
        #     effective_deposits=ContractBalanceUserDeposits(),
        # ),

    # future_rewards = future_rewards_service.get_octant_rewards(future_context)



    # return core.estimate_budget(
    #     current_context,
    #     future_context,
    #     current_rewards,
    #     future_rewards,
    #     lock_duration_sec,
    #     glm_amount,
    # )

    remaining_lock_duration = lock_duration_sec

    budget = estimate_epoch_budget(
        current_epoch_start,
        current_epoch_start + current_epoch_duration,
        current_epoch_remaining,
        remaining_lock_duration,
        request.glm_amount,
        current_rewards,
    )
    remaining_lock_duration -= current_epoch_remaining

    if remaining_lock_duration > 0:
        full_epochs_num, remaining_future_epoch_sec = divmod(
            remaining_lock_duration, future_epoch_duration
        )
        budget += full_epochs_num * estimate_epoch_budget(
            future_epoch_start,
            future_epoch_end,
            future_epoch_duration,
            future_epoch_duration,
            request.glm_amount,
            future_rewards,
        )
        remaining_lock_duration = remaining_future_epoch_sec

    if remaining_lock_duration > 0:
        budget += estimate_epoch_budget(
            future_epoch_start,
            future_epoch_end,
            future_epoch_duration,
            remaining_lock_duration,
            request.glm_amount,
            future_rewards,
        )

    return UserBudgetResponseV1(
        budget=budget
    )


@api.get("/leverage/{epoch_number}")
async def get_rewards_leverage_v1(
    session: GetSession,
    epochs_contracts: GetEpochsContracts,
    epoch_number: int,
) -> RewardsLeverageResponseV1:
    """
    Returns leverage for a given epoch.

    For finalized epochs it returns the leverage based on the data from the finalized snapshot.

    """

    epoch_state = await get_epoch_state(session, epochs_contracts, epoch_number)

    print("Epoch state", epoch_state)
    if epoch_state > EpochState.PENDING:
        raise NotImplementedForGivenEpochState()

    if epoch_state == EpochState.FINALIZED:
        # We are in pending epoch, so we need to get the leverage from the pending epoch

        allocations_sum = await sum_allocations_by_epoch(session, epoch_number)

        # allocations_sum = database.allocations.get_alloc_sum_by_epoch(
        #     context.epoch_details.epoch_num
        # )

        finalized_snapshot = await get_finalized_epoch_snapshot(session, epoch_number)
        # finalized_snapshot = database.finalized_epoch_snapshot.get_by_epoch(
        #     context.epoch_details.epoch_num
        # )
        matched_rewards = int(finalized_snapshot.matched_rewards)

        return RewardsLeverageResponseV1(
            leverage=matched_rewards / allocations_sum if allocations_sum else 0
        )

        # return context.epoch_settings.project.rewards.leverage.calculate_leverage(
        #     matched_rewards, allocations_sum
        # )
        # def calculate_leverage(self, matched_rewards: int, total_allocated: int) -> float:
        # return matched_rewards / total_allocated if total_allocated else 0

    if epoch_state <= EpochState.PENDING:
        allocations_sum = await sum_allocations_by_epoch(session, epoch_number)
        # allocations_sum = database.allocations.get_alloc_sum_by_epoch(
        #     context.epoch_details.epoch_num
        # )
        matched_rewards = self.get_matched_rewards(context)

        return RewardsLeverageResponseV1(
            leverage=matched_rewards / allocations_sum if allocations_sum else 0
        )

        # return context.epoch_settings.project.rewards.leverage.calculate_leverage(
        #     matched_rewards, allocations_sum
        # )
        # def calculate_leverage(self, matched_rewards: int, total_allocated: int) -> float:
        # return matched_rewards / total_allocated if total_allocated else 0


@api.get("/merkle_tree/{epoch_number}")
async def get_rewards_merkle_tree_v1(
    session: GetSession,
    epoch_number: int,
) -> RewardsMerkleTreeResponseV1:
    """
    Returns the rewards merkle tree for a given epoch.
    """

    return await get_rewards_merkle_tree_for_epoch(session, epoch_number)


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
    epoch_number: int,
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
        address: budget for address, budget in budgets.items() 
        if address not in set(donors + patrons)
    }

    return UnusedRewardsResponseV1(
        addresses=sorted(list(unused_budgets.keys())), 
        value=sum(unused_budgets.values()),
    )

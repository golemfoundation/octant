from fastapi import APIRouter
from app.context.epoch_state import EpochState
from app.exceptions import NotImplementedForGivenEpochState
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
) -> UserBudgetResponseV1:
    """
    Returns user's rewards budget available to allocate for given epoch
    """
    budget = await get_budget_by_user_address_and_epoch(
        session,
        user_address,
        epoch_number,
    )

    # Q: Should we return 0 or raise exception when user has no budget for the epoch?

    return UserBudgetResponseV1(budget=budget or 0)


@api.get("/budget/{user_address}/upcoming")
async def get_user_budget_for_upcoming_epoch_v1(

    user_address: Address,
) -> UpcomingUserBudgetResponseV1:
    """
    Returns the upcoming user budget based on if allocation happened now.
    """
    # TODO we need to handle snapshots here unfortunatelly
    upcoming_budget = await get_upcoming_user_budget(user_address)

    # context = state_context(EpochState.SIMULATED, with_block_range=True)

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
    request: EstimatedBudgetByEpochRequestV1,
) -> UserBudgetWithMatchedFundingResponseV1:
    # leverage = octant_rewards_controller.get_last_finalized_epoch_leverage()
    #     context = state_context(EpochState.FINALIZED)
    #     service = get_services(context.epoch_state).octant_rewards_service

    #     return service.get_leverage(context)
    #         allocations_sum = database.allocations.get_alloc_sum_by_epoch(
    #             context.epoch_details.epoch_num
    #         )
    #         finalized_snapshot = database.finalized_epoch_snapshot.get_by_epoch(
    #             context.epoch_details.epoch_num
    #         )
    #         matched_rewards = int(finalized_snapshot.matched_rewards)

    #         return context.epoch_settings.project.rewards.leverage.calculate_leverage(
    #             matched_rewards, allocations_sum
    #         )
            # Leverage:
            # return matched_rewards / total_allocated if total_allocated else 0

    # epochs_budget = budget_controller.estimate_epochs_budget(no_epochs, glm_amount)
    #     validate_estimate_budget_by_epochs_inputs(no_epochs, glm_amount)

    #     future_context = state_context(EpochState.FUTURE)
    #     future_rewards_service = get_services(EpochState.FUTURE).octant_rewards_service
    #     future_rewards = future_rewards_service.get_octant_rewards(future_context)

        # def _get_future_epoch_details(epoch_num: int) -> EpochDetails:
        #     epoch_details = epochs.get_future_epoch_props()
        #     start = epoch_details[2]
        #     duration = epoch_details[3]
        #     decision_window = epoch_details[4]
        #     return EpochDetails(
        #         epoch_num=epoch_num,
        #         start=start,
        #         duration=duration,
        #         decision_window=decision_window,
        #         remaining_sec=duration,
        #     )

        # return FutureServices(
        #     octant_rewards_service=CalculatedOctantRewards(
        #         staking_proceeds=EstimatedStakingProceeds(),
        #         effective_deposits=ContractBalanceUserDeposits(),
        #     ),
        #     projects_metadata_service=StaticProjectsMetadataService(),
        #     projects_details_service=StaticProjectsDetailsService(),
        # )

        # future_rewards = await get_octant_rewards(session, epoch_number, start_sec, end_sec)


    #     epoch_duration = future_context.epoch_details.duration_sec

    #     return no_epochs * core.estimate_epoch_budget(
    #         future_context, future_rewards, epoch_duration, glm_amount
    #     )

    matching_fund = budget_controller.get_matching_fund(epochs_budget, leverage)
    # def get_matching_fund(budget: int, leverage: float) -> int:
    # return core.calculate_matching_fund(budget, leverage)
    # def calculate_matching_fund(budget: int, leverage: float) -> int:
    # return int(budget * leverage)

    return EstimatedRewardsDTO(
        estimated_budget=epochs_budget, leverage=leverage, matching_fund=matching_fund
    )


@api.post("/estimated_budget/by_days")
async def get_estimated_budget_by_days_v1(
    request: EstimatedBudgetByDaysRequestV1,
) -> UserBudgetResponseV1:
    validate_estimate_budget_inputs(days, glm_amount)

    lock_duration_sec = days_to_sec(days)
    return estimate_budget(lock_duration_sec, glm_amount)
    # current_context = state_context(EpochState.CURRENT)
    # current_rewards_service = get_services(EpochState.CURRENT).octant_rewards_service
    # current_rewards = current_rewards_service.get_octant_rewards(current_context)

    # future_context = state_context(EpochState.FUTURE)
    # future_rewards_service = get_services(EpochState.FUTURE).octant_rewards_service
    # future_rewards = future_rewards_service.get_octant_rewards(future_context)

    # return core.estimate_budget(
    #     current_context,
    #     future_context,
    #     current_rewards,
    #     future_rewards,
    #     lock_duration_sec,
    #     glm_amount,
    # )


@api.get("/leverage/{epoch_number}")
async def get_rewards_leverage_v1(
    session: GetSession,
    epochs_contracts: GetEpochsContracts,
    epoch_number: int,
) -> RewardsLeverageResponseV1:
    epoch_state = await get_epoch_state(session, epochs_contracts, epoch_number)

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

    This endpoint is available only for the pending epoch state.
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
    Returns unallocated value and the number of users who didn't use their rewards in an epoch
    """

    ts = await epoch_subgraph.get_epoch_by_number(epoch_number)

    budgets = await get_all_users_budgets_by_epoch(session, epoch_number)

    # budgets = self.user_budgets.get_all_budgets(context)
    #     budgets = Budget.query.filter_by(epoch=epoch).all()
    # return {budget.user.address: int(budget.budget) for budget in budgets}

    donors = await get_donors_for_epoch(session, epoch_number)
    # donors = self.allocations.get_all_donors_addresses(context)
    # users = User.query.filter(
    #     User.allocations.any(epoch=epoch_num, deleted_at=None)
    # ).all()
    # return [u.address for u in users]

    patrons = await get_all_patrons_at_timestamp(
        session, ts.finalized_timestamp.datetime()
    )

    excluded_addresses = set(donors + patrons)

    unused_budgets = {budget for budget in budgets if budget not in excluded_addresses}

    return UnusedRewardsResponseV1(
        addresses=list(unused_budgets.keys()), value=sum(unused_budgets.values())
    )

    # patrons = self.patrons_mode.get_all_patrons_addresses(context)
    # patrons = self._get_patron_budgets(context.epoch_details, with_budget)
    #     ts = epoch.finalized_timestamp
    # patrons = database.patrons.get_all_patrons_at_timestamp(ts.datetime())

    # if with_budget:
    #     all_budgets = database.budgets.get_all_by_epoch(epoch.epoch_num)
    #     return {
    #         patron: all_budgets[patron]
    #         for patron in patrons
    #         if patron in all_budgets.keys()
    #     }
    # else:
    #     return {patron: 0 for patron in patrons}

    # return list(patrons.keys())

    # return get_unused_rewards(budgets, donors, patrons)


# def get_unused_rewards(
#     budgets: Dict[str, int], donors: List[str], patrons: List[str]
# ) -> Dict[str, int]:
#     for donor in donors:
#         budgets.pop(donor)
#     for patron in patrons:
#         budgets.pop(patron)

#     return budgets

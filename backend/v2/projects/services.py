


from sqlalchemy.ext.asyncio import AsyncSession

from backend.v2.allocations.repositories import sum_allocations_by_epoch
from backend.v2.epochs.repositories import get_pending_epoch_snapshot_by_epoch
from backend.v2.projects.contracts import Projects



async def get_projects_allocation_threshold(
    # Dependencies
    session: AsyncSession,
    projects: Projects,
    # Arguments
    epoch_number: int,
    project_count_multiplier: int = 1,
) -> int:

    # PROJECTS_COUNT_MULTIPLIER = 1  # TODO: from settings?

    total_allocated = await sum_allocations_by_epoch(session, epoch_number)
    project_addresses = await projects.get_project_addresses(epoch_number)

    return _calculate_threshold(total_allocated, len(project_addresses), project_count_multiplier)


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
    projects: Projects,

    # Arguments
    epoch_number: int,
) -> int:
    pass

    all_projects = await projects.get_project_addresses(epoch_number)


async def get_estimated_project_matched_rewards_pending(
    # Dependencies
    session: AsyncSession,
    projects: Projects,

    # Arguments
    epoch_number: int,
) -> int:
     
#     pending_snapshot = await get_pending_epoch_snapshot_by_epoch(session, epoch_number)

#     patrons_rewards = 

#     def get_patrons_rewards(self, context: Context) -> int:
#         epoch = context.epoch_details
#         patrons = database.patrons.get_all_patrons_at_timestamp(
#             epoch.finalized_timestamp.datetime()
#         )
#         return database.budgets.get_sum_by_users_addresses_and_epoch(
#             patrons, epoch.epoch_num
#         )


# def get_matched_rewards()
#         patrons_mode: UserPatronMode

#     def get_matched_rewards(self, context: Context) -> int:
#         pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(
#             context.epoch_details.epoch_num
#         )
#         patrons_rewards = self.patrons_mode.get_patrons_rewards(context)
#         matched_rewards_settings = context.epoch_settings.octant_rewards.matched_rewards

#         return matched_rewards_settings.calculate_matched_rewards(
#             MatchedRewardsPayload(
#                 total_rewards=int(pending_snapshot.total_rewards),
#                 vanilla_individual_rewards=int(
#                     pending_snapshot.vanilla_individual_rewards
#                 ),
#                 patrons_rewards=patrons_rewards,
#                 staking_proceeds=int(pending_snapshot.eth_proceeds),
#                 locked_ratio=Decimal(pending_snapshot.locked_ratio),
#                 ire_percent=context.epoch_settings.octant_rewards.total_and_vanilla_individual_rewards.IRE_PERCENT,
#                 tr_percent=context.epoch_settings.octant_rewards.total_and_vanilla_individual_rewards.TR_PERCENT,
#             )
#         )


# project_rewards = get_estimated_project_rewards().rewards

# def get_project_rewards(self, context: Context) -> ProjectRewardsResult:
#     project_settings = context.epoch_settings.project # .rewards CappedQuadraticFundingProjectRewards
#     # all_projects = context.projects_details.projects
#     matched_rewards = self.octant_rewards.get_matched_rewards(context)
#     allocations = database.allocations.get_all_with_uqs(
#         context.epoch_details.epoch_num
#     )

#     allocations_payload = AllocationsPayload(
#         before_allocations=allocations, user_new_allocations=[]
#     )
#     projects_rewards = get_projects_rewards(
#         project_settings,
#         allocations_payload,
#         all_projects,
#         matched_rewards,
#     )

#     return projects_rewards

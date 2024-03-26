from typing import List, Tuple, Protocol, runtime_checkable
from app.pydantic import Model

from app import exceptions
from app.extensions import db
from app.context.manager import Context
from app.engine.projects.rewards import ProjectRewardDTO
from app.infrastructure import database
from app.modules.dto import AllocationDTO, UserAllocationRequestPayload
from app.modules.user.allocations import core
from app.modules.user.allocations.service.saved import SavedUserAllocations


@runtime_checkable
class OctantRewards(Protocol):
    def get_matched_rewards(self, context: Context) -> int:
        ...


@runtime_checkable
class UserBudgetProtocol(Protocol):
    def get_budget(self, context: Context, user_address: str) -> int:
        ...


@runtime_checkable
class GetPatronsAddressesProtocol(Protocol):
    def get_all_patrons_addresses(self, context: Context) -> List[str]:
        ...


class PendingUserAllocations(SavedUserAllocations, Model):
    octant_rewards: OctantRewards
    user_budgets: UserBudgetProtocol
    patrons_mode: GetPatronsAddressesProtocol

    def allocate(
        self, context: Context, payload: UserAllocationRequestPayload, **kwargs
    ) -> str:
        user_address = core.recover_user_address(payload)

        expected_nonce = self.get_user_next_nonce(user_address)
        user_budget = self.user_budgets.get_budget(context, user_address)
        patrons = self.patrons_mode.get_all_patrons_addresses(context)

        core.verify_user_allocation_request(
            context, payload, user_address, expected_nonce, user_budget, patrons
        )

        self.revoke_previous_allocation(context, user_address)
        database.allocations.store_allocation_request(
            user_address, context.epoch_details.epoch_num, payload, **kwargs
        )

        db.session.commit()

        return user_address

    def simulate_allocation(
        self,
        context: Context,
        user_allocations: List[AllocationDTO],
        user_address: str,
    ) -> Tuple[float, int, List[ProjectRewardDTO]]:
        projects_settings = context.epoch_settings.project
        projects = context.projects_details.projects
        matched_rewards = self.octant_rewards.get_matched_rewards(context)
        all_allocations_before = database.allocations.get_all(
            context.epoch_details.epoch_num
        )

        return core.simulate_allocation(
            projects_settings,
            all_allocations_before,
            user_allocations,
            user_address,
            projects,
            matched_rewards,
        )

    def revoke_previous_allocation(self, context: Context, user_address: str):
        user = database.user.get_by_address(user_address)
        if user is None:
            raise exceptions.UserNotFound

        database.allocations.soft_delete_all_by_epoch_and_user_id(
            context.epoch_details.epoch_num, user.id
        )

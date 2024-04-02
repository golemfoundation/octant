from typing import List, Tuple, Protocol, runtime_checkable

from app import exceptions
from app.context.manager import Context
from app.engine.projects.rewards import ProjectRewardDTO
from app.exceptions import InvalidSignature
from app.extensions import db
from app.infrastructure import database
from app.modules.common.signature import (
    verify_signed_message,
    encode_for_signing,
    EncodingStandardFor,
)
from app.legacy.crypto.eip712 import build_allocations_eip712_structure
from app.modules.common.verifier import Verifier
from app.modules.dto import AllocationDTO, UserAllocationRequestPayload
from app.modules.user.allocations import core
from app.modules.user.allocations.service.saved import SavedUserAllocations
from app.pydantic import Model


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


class PendingUserAllocationsVerifier(Verifier, Model):
    user_budgets: UserBudgetProtocol
    patrons_mode: GetPatronsAddressesProtocol

    def _verify_logic(self, context: Context, **kwargs):
        user_address, payload, expected_nonce = (
            kwargs["user_address"],
            kwargs["payload"],
            kwargs["expected_nonce"],
        )
        user_budget = self.user_budgets.get_budget(context, user_address)
        patrons = self.patrons_mode.get_all_patrons_addresses(context)

        core.verify_user_allocation_request(
            context, payload, user_address, expected_nonce, user_budget, patrons
        )

    def _verify_signature(self, _: Context, **kwargs):
        user_address, signature = kwargs["user_address"], kwargs["payload"].signature
        eip712_encoded = build_allocations_eip712_structure(kwargs["payload"].payload)
        encoded_msg = encode_for_signing(EncodingStandardFor.DATA, eip712_encoded)
        if not verify_signed_message(user_address, encoded_msg, signature):
            raise InvalidSignature(user_address, signature)


class PendingUserAllocations(SavedUserAllocations, Model):
    octant_rewards: OctantRewards
    verifier: Verifier

    def allocate(
        self,
        context: Context,
        user_address: str,
        payload: UserAllocationRequestPayload,
        **kwargs
    ) -> str:
        expected_nonce = self.get_user_next_nonce(user_address)
        self.verifier.verify(
            context,
            user_address=user_address,
            payload=payload,
            expected_nonce=expected_nonce,
            **kwargs
        )

        self.revoke_previous_allocation(context, user_address)

        user = database.user.get_by_address(user_address)
        user.allocation_nonce = expected_nonce
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

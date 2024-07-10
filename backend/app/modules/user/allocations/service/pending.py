from decimal import Decimal
from typing import List, Tuple, Protocol, runtime_checkable, Optional

from app import exceptions
from app.context.manager import Context
from app.engine.projects.rewards import ProjectRewardDTO
from app.exceptions import InvalidSignature
from app.extensions import db
from app.infrastructure import database
from app.legacy.crypto.eip712 import build_allocations_eip712_structure
from app.modules.common.crypto.signature import (
    verify_signed_message,
    encode_for_signing,
    EncodingStandardFor,
)
from app.modules.common.project_rewards import AllocationsPayload
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


@runtime_checkable
class GetUserAllocationNonceProtocol(Protocol):
    def get_user_next_nonce(self, user_address: str) -> int:
        ...


@runtime_checkable
class UniquenessQuotients(Protocol):
    def calculate(self, context: Context, user_address: str) -> Decimal:
        ...

    def retrieve(
        self, context: Context, user_address: str, should_save: bool = False
    ) -> Decimal:
        ...


class PendingUserAllocationsVerifier(Verifier, Model):
    user_budgets: UserBudgetProtocol
    user_nonce: GetUserAllocationNonceProtocol
    patrons_mode: GetPatronsAddressesProtocol

    def _verify_logic(self, context: Context, **kwargs):
        user_address, payload = (
            kwargs["user_address"],
            kwargs["payload"],
        )
        expected_nonce = self.user_nonce.get_user_next_nonce(user_address)
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
    uniqueness_quotients: UniquenessQuotients

    def _expand_user_allocations_with_score(
        self, user_allocations: List[AllocationDTO], uq_score: Decimal
    ) -> List[AllocationDTO]:
        return [
            AllocationDTO(
                project_address=allocation.project_address,
                amount=allocation.amount,
                uq_score=uq_score,
            )
            for allocation in user_allocations
        ]

    def allocate(
        self,
        context: Context,
        user_address: str,
        payload: UserAllocationRequestPayload,
        **kwargs
    ) -> str:
        self.verifier.verify(
            context, user_address=user_address, payload=payload, **kwargs
        )

        user = database.user.get_by_address(user_address)

        uq_score = self.uniqueness_quotients.retrieve(
            context, user_address, should_save=True
        )

        leverage, _, _ = self.simulate_allocation(
            context, payload.payload.allocations, user_address, uq_score
        )

        self.revoke_previous_allocation(context, user_address)

        user.allocation_nonce = payload.payload.nonce
        database.allocations.store_allocation_request(
            user_address,
            context.epoch_details.epoch_num,
            payload,
            leverage=leverage,
            **kwargs
        )

        db.session.commit()

        return user_address

    def simulate_allocation(
        self,
        context: Context,
        user_allocations: List[AllocationDTO],
        user_address: str,
        uq_score: Optional[Decimal] = None,
    ) -> Tuple[float, int, List[ProjectRewardDTO]]:
        projects_settings = context.epoch_settings.project
        projects = context.projects_details.projects
        epoch_num = context.epoch_details.epoch_num

        matched_rewards = self.octant_rewards.get_matched_rewards(context)
        all_allocations_before = database.allocations.get_all_with_uqs(epoch_num)

        if uq_score is None:
            uq_score = self.uniqueness_quotients.calculate(context, user_address)

        user_allocations = self._expand_user_allocations_with_score(
            user_allocations, uq_score
        )

        allocations_payload = AllocationsPayload(
            before_allocations=all_allocations_before,
            user_new_allocations=user_allocations,
        )
        return core.simulate_allocation(
            projects_settings,
            allocations_payload,
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

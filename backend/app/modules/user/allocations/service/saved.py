from typing import List, Tuple, Optional

from app.context.manager import Context
from app.infrastructure import database
from app.modules.common.time import Timestamp, from_datetime
from app.modules.dto import AllocationItem, AccountFundsDTO, ProposalDonationDTO
from app.modules.history.dto import AllocationItem as HistoryAllocationItem
from app.modules.user.allocations import core
from app.pydantic import Model


class SavedUserAllocations(Model):
    def get_user_next_nonce(self, user_address: str) -> int:
        allocation_request = database.allocations.get_user_last_allocation_request(
            user_address
        )
        return core.next_allocation_nonce(allocation_request)

    def get_all_donors_addresses(self, context: Context) -> List[str]:
        return database.allocations.get_users_with_allocations(
            context.epoch_details.epoch_num
        )

    def get_all_users_with_allocations_sum(
        self, context: Context
    ) -> List[AccountFundsDTO]:
        return database.allocations.get_users_alloc_sum_by_epoch(
            context.epoch_details.epoch_num
        )

    def get_user_allocation_sum(self, context: Context, user_address: str) -> int:
        return database.allocations.get_user_alloc_sum_by_epoch(
            context.epoch_details.epoch_num, user_address
        )

    def has_user_allocated_rewards(self, context: Context, user_address: str) -> bool:
        allocation_signature = (
            database.allocations.get_allocation_request_by_user_and_epoch(
                user_address, context.epoch_details.epoch_num
            )
        )
        return allocation_signature is not None

    def get_user_allocations_by_timestamp(
        self, user_address: str, from_timestamp: Timestamp, limit: int
    ) -> List[AllocationItem]:
        return [
            HistoryAllocationItem(
                project_address=r.proposal_address,
                epoch=r.epoch,
                amount=int(r.amount),
                timestamp=from_datetime(r.created_at),
            )
            for r in database.allocations.get_user_allocations_history(
                user_address, from_timestamp.datetime(), limit
            )
        ]

    def get_all_allocations(self, context: Context) -> List[ProposalDonationDTO]:
        allocations = database.allocations.get_all(context.epoch_details.epoch_num)
        return [
            ProposalDonationDTO(
                donor=alloc.user_address,
                amount=alloc.amount,
                proposal=alloc.proposal_address,
            )
            for alloc in allocations
        ]

    def get_allocations_by_project(
        self, context: Context, project_address: str
    ) -> List[ProposalDonationDTO]:
        allocations = database.allocations.get_all_by_project_addr_and_epoch(
            project_address, context.epoch_details.epoch_num
        )

        return [
            ProposalDonationDTO(
                donor=a.user.address, amount=int(a.amount), proposal=project_address
            )
            for a in allocations
            if int(a.amount) != 0
        ]

    def get_last_user_allocation(
        self, context: Context, user_address: str
    ) -> Tuple[List[AccountFundsDTO], Optional[bool]]:
        epoch_num = context.epoch_details.epoch_num
        last_request = database.allocations.get_allocation_request_by_user_and_epoch(
            user_address, epoch_num
        )

        if not last_request:
            return [], None

        allocations = database.allocations.get_all_by_user_addr_and_epoch(
            user_address, epoch_num
        )

        return allocations, last_request.is_manually_edited

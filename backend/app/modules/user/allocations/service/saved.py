from typing import List, Tuple, Optional

from app.context.manager import Context
from app.infrastructure import database
from app.modules.common.time import Timestamp, from_datetime
from app.modules.dto import AccountFundsDTO, ProjectDonationDTO
from app.modules.history.dto import (
    AllocationItem as HistoryAllocationItem,
    ProjectAllocationItem,
)
from app.pydantic import Model


class SavedUserAllocations(Model):
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

    def get_allocation_sum_by_epoch(self, epoch_num: int) -> int:
        return database.allocations.get_alloc_sum_by_epoch(epoch_num)

    def has_user_allocated_rewards(self, context: Context, user_address: str) -> bool:
        allocation_signature = (
            database.allocations.get_allocation_request_by_user_and_epoch(
                user_address, context.epoch_details.epoch_num
            )
        )
        return allocation_signature is not None

    def get_user_allocations_by_timestamp(
        self, user_address: str, from_timestamp: Timestamp, limit: int
    ) -> List[HistoryAllocationItem]:
        allocation_requests = database.allocations.get_user_allocations_history(
            user_address, from_timestamp.datetime(), limit
        )

        history_items = []
        for alloc_request, allocations in allocation_requests:
            item = HistoryAllocationItem(
                epoch=alloc_request.epoch,
                timestamp=from_datetime(alloc_request.created_at),
                is_manually_edited=alloc_request.is_manually_edited,
                leverage=alloc_request.leverage,
                allocations=[
                    ProjectAllocationItem(
                        project_address=a.project_address, amount=int(a.amount)
                    )
                    for a in allocations
                ],
            )
            history_items.append(item)

        return history_items

    def get_all_allocations(
        self, context: Context, include_zero_allocations=True
    ) -> List[ProjectDonationDTO]:
        allocations = database.allocations.get_all(context.epoch_details.epoch_num)
        return [
            ProjectDonationDTO(
                donor=alloc.user_address,
                amount=alloc.amount,
                project=alloc.project_address,
            )
            for alloc in allocations
            if include_zero_allocations or alloc.amount > 0
        ]

    def get_allocations_by_project(
        self, context: Context, project_address: str
    ) -> List[ProjectDonationDTO]:
        allocations = database.allocations.get_all_by_project_addr_and_epoch(
            project_address, context.epoch_details.epoch_num
        )

        return [
            ProjectDonationDTO(
                donor=a.user.address, amount=int(a.amount), project=project_address
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

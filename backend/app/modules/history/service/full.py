from typing import Protocol, runtime_checkable

from app.context.manager import Context
from app.modules.common.pagination import Cursor, Paginator
from app.modules.common.time import Timestamp
from app.modules.history.core import sort_history_records
from app.modules.history.dto import (
    LockItem,
    AllocationItem,
    WithdrawalItem,
    PatronDonationItem,
    UserHistoryDTO,
)
from app.pydantic import Model


@runtime_checkable
class UserDeposits(Protocol):
    def get_locks(
        self, user_address: str, from_timestamp: Timestamp, limit: int
    ) -> list[LockItem]:
        ...

    def get_unlocks(
        self, user_address: str, from_timestamp: Timestamp, limit: int
    ) -> list[LockItem]:
        ...


@runtime_checkable
class UserAllocations(Protocol):
    def get_user_allocations_by_timestamp(
        self, user_address: str, from_timestamp: Timestamp, limit: int
    ) -> list[AllocationItem]:
        ...


@runtime_checkable
class UserWithdrawals(Protocol):
    def get_withdrawals(
        self, user_address: str, from_timestamp: Timestamp, limit: int
    ) -> list[WithdrawalItem]:
        ...


@runtime_checkable
class PatronDonations(Protocol):
    def get_patron_donations(
        self, context: Context, user_address: str, from_timestamp: Timestamp, limit: int
    ) -> list[PatronDonationItem]:
        ...


class FullHistory(Model):
    user_deposits: UserDeposits
    user_allocations: UserAllocations
    user_withdrawals: UserWithdrawals
    patron_donations: PatronDonations

    def get_user_history(
        self, context: Context, user_address: str, cursor: str = None, limit: int = 20
    ) -> UserHistoryDTO:
        limit = limit if limit is not None and limit < 100 else 100
        from_timestamp, offset_at_timestamp = Cursor.decode(cursor)
        query_limit = Paginator.query_limit(limit, offset_at_timestamp)

        locks = self.user_deposits.get_locks(user_address, from_timestamp, query_limit)
        unlocks = self.user_deposits.get_unlocks(
            user_address, from_timestamp, query_limit
        )
        allocations = self.user_allocations.get_user_allocations_by_timestamp(
            user_address, from_timestamp, query_limit
        )
        withdrawals = self.user_withdrawals.get_withdrawals(
            user_address, from_timestamp, query_limit
        )
        patron_donations = self.patron_donations.get_patron_donations(
            context, user_address, from_timestamp, query_limit
        )

        history_records = sort_history_records(
            locks, unlocks, allocations, withdrawals, patron_donations
        )
        history, next_cursor = Paginator.extract_page(
            history_records, offset_at_timestamp, limit
        )

        return UserHistoryDTO(history=history, next_cursor=next_cursor)

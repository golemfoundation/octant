from typing import Tuple, List, Protocol, Dict, runtime_checkable

from app.context.manager import Context
from app.engine.user.effective_deposit import UserDeposit, DepositEvent
from app.infrastructure.graphql import locks, unlocks
from app.modules.common.effective_deposits import calculate_effective_deposits
from app.modules.common.time import Timestamp, from_timestamp_s
from app.modules.history.dto import LockItem, OpType
from app.pydantic import Model


@runtime_checkable
class EventsGenerator(Protocol):
    def get_user_events(
        self, context: Context, user_address: str
    ) -> List[DepositEvent]:
        ...

    def get_all_users_events(self, context: Context) -> Dict[str, List[DepositEvent]]:
        ...


class CalculatedUserDeposits(Model):
    events_generator: EventsGenerator

    def get_all_effective_deposits(
        self, context: Context
    ) -> Tuple[List[UserDeposit], int]:
        events = self.events_generator.get_all_users_events(context)
        return calculate_effective_deposits(
            context.epoch_details, context.epoch_settings, events
        )

    def get_total_effective_deposit(self, context: Context) -> int:
        events = self.events_generator.get_all_users_events(context)
        _, total = calculate_effective_deposits(
            context.epoch_details, context.epoch_settings, events
        )
        return total

    def get_user_effective_deposit(self, context: Context, user_address: str) -> int:
        events = {
            user_address: self.events_generator.get_user_events(context, user_address)
        }
        deposits, _ = calculate_effective_deposits(
            context.epoch_details, context.epoch_settings, events
        )
        return deposits[0].effective_deposit

    def get_locks(
        self, user_address: str, from_timestamp: Timestamp, limit: int
    ) -> list[LockItem]:
        return [
            LockItem(
                type=OpType.LOCK,
                amount=int(r["amount"]),
                timestamp=from_timestamp_s(r["timestamp"]),
                transaction_hash=r["transactionHash"],
            )
            for r in locks.get_user_locks_history(
                user_address, int(from_timestamp.timestamp_s()), limit
            )
        ]

    def get_unlocks(
        self, user_address: str, from_timestamp: Timestamp, limit: int
    ) -> list[LockItem]:
        return [
            LockItem(
                type=OpType.UNLOCK,
                amount=int(r["amount"]),
                timestamp=from_timestamp_s(r["timestamp"]),
                transaction_hash=r["transactionHash"],
            )
            for r in unlocks.get_user_unlocks_history(
                user_address, int(from_timestamp.timestamp_s()), limit
            )
        ]

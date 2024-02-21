from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import StrEnum
from typing import Tuple, List, Dict, Optional

from dataclass_wizard import JSONWizard
from eth_utils import to_checksum_address


class EventType(StrEnum):
    LOCK = "Locked"
    UNLOCK = "Unlocked"


def _calculate_deposit_after_event(
    event_type: EventType, before: int, amount: int
) -> int:
    match event_type:
        case EventType.LOCK:
            return before + amount
        case EventType.UNLOCK:
            return before - amount
        case _:
            raise TypeError


@dataclass
class DepositEvent:
    user: Optional[str]
    type: EventType
    timestamp: int
    amount: int
    deposit_before: int
    deposit_after: int

    def __init__(
        self,
        user: Optional,
        type: EventType,
        timestamp: int,
        amount: int,
        deposit_before: int,
    ):
        self.user = user
        self.type = type
        self.timestamp = timestamp
        self.amount = amount
        self.deposit_before = deposit_before
        self.deposit_after = _calculate_deposit_after_event(
            type, deposit_before, amount
        )

    @staticmethod
    def from_dict(event: Dict):
        event_type = EventType(event["__typename"])
        user = to_checksum_address(event["user"])
        timestamp = int(event["timestamp"])
        amount = int(event["amount"])
        deposit_before = int(event["depositBefore"])

        return DepositEvent(
            user=user,
            type=event_type,
            timestamp=timestamp,
            amount=amount,
            deposit_before=deposit_before,
        )


@dataclass(frozen=True)
class UserDeposit(JSONWizard):
    user_address: str | None
    effective_deposit: int
    deposit: int

    def __iter__(self):
        yield self.user_address
        yield self.effective_deposit
        yield self.deposit


@dataclass
class UserEffectiveDepositPayload:
    epoch_start: int = None
    epoch_end: int = None
    lock_events_by_addr: Dict[str, List[DepositEvent]] = None


@dataclass
class UserEffectiveDeposit(ABC):
    @abstractmethod
    def calculate_users_effective_deposits(
        self, payload: UserEffectiveDepositPayload
    ) -> Tuple[List[UserDeposit], int]:
        pass

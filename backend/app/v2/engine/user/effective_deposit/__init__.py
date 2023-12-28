from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import StrEnum
from typing import Tuple, List, Dict, Optional

from dataclass_wizard import JSONWizard
from eth_utils import to_checksum_address


class EventType(StrEnum):
    LOCK = "Locked"
    UNLOCK = "Unlocked"


@dataclass(frozen=True)
class DepositEvent:
    user: Optional[str]
    type: EventType
    timestamp: int
    amount: int
    deposit_before: int

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
    user_address: str
    effective_deposit: int
    deposit: int


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

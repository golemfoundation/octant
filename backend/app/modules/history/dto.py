from dataclasses import dataclass
from enum import StrEnum
from typing import Optional

from dataclass_wizard import JSONWizard

from app.modules.common.pagination import PageRecord
from app.modules.common.time import Timestamp


class OpType(StrEnum):
    LOCK = "lock"
    UNLOCK = "unlock"
    ALLOCATION = "allocation"
    WITHDRAWAL = "withdrawal"
    PATRON_MODE_DONATION = "patron_mode_donation"


@dataclass(frozen=True)
class LockItem:
    type: OpType
    amount: int
    timestamp: Timestamp
    transaction_hash: str


@dataclass(frozen=True)
class AllocationItem:
    project_address: str
    epoch: int
    amount: int
    timestamp: Timestamp


@dataclass(frozen=True)
class WithdrawalItem:
    type: OpType
    amount: int
    address: str
    timestamp: Timestamp
    transaction_hash: str


@dataclass(frozen=True)
class PatronDonationItem:
    timestamp: Timestamp
    epoch: int
    amount: int


@dataclass(frozen=True)
class HistoryEntry(PageRecord, JSONWizard):
    type: OpType


@dataclass(frozen=True)
class TransactionHistoryEntry(HistoryEntry):
    transaction_hash: str
    amount: int


@dataclass(frozen=True)
class AllocationHistoryEntry(HistoryEntry):
    project_address: str
    amount: int


@dataclass(frozen=True)
class PatronModeDonationEntry(HistoryEntry):
    epoch: int
    amount: int


@dataclass(frozen=True)
class UserHistoryDTO(JSONWizard):
    history: list[HistoryEntry]
    next_cursor: Optional[str]

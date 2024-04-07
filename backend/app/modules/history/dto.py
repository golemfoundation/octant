from dataclasses import dataclass
from enum import StrEnum
from typing import Optional, List

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
class HistoryEntryData(JSONWizard):
    pass


@dataclass(frozen=True)
class TransactionHistoryEntry(HistoryEntryData):
    transaction_hash: str
    amount: int


@dataclass(frozen=True)
class AllocationHistoryEntry(HistoryEntryData):
    project_address: str
    amount: int


@dataclass(frozen=True)
class PatronModeDonationEntry(HistoryEntryData):
    epoch: int
    amount: int


@dataclass(frozen=True)
class HistoryEntry(PageRecord, JSONWizard):
    type: OpType
    event_data: HistoryEntryData


@dataclass(frozen=True)
class UserHistoryDTO(JSONWizard):
    history: List[HistoryEntry]
    next_cursor: Optional[str]

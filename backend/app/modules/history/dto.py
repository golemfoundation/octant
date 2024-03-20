from dataclasses import dataclass
from typing import Optional

from dataclass_wizard import JSONWizard

from app.modules.common.pagination import PageRecord
from app.modules.dto import OpType


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

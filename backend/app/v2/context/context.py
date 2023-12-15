from abc import ABC
from dataclasses import dataclass
from typing import List, Dict

from app import database
from app.database.models import PendingEpochSnapshot, FinalizedEpochSnapshot, User
from app.extensions import epochs
from app.v2.context import epoch
from app.v2.context.epoch import EpochDetails
from app.v2.engine.epochs_settings import EpochSettings, get_epoch_settings


@dataclass(frozen=True)
class EpochContext(ABC):
    epoch_settings: EpochSettings
    epoch_details: EpochDetails


@dataclass(frozen=True)
class CurrentEpochContext(EpochContext):
    pass


@dataclass(frozen=True)
class PendingEpochContext(EpochContext):
    pending_snapshot: PendingEpochSnapshot = None


@dataclass(frozen=True)
class FinalizedEpochContext(EpochContext):
    finalized_snapshot: FinalizedEpochSnapshot = None


@dataclass
class Context:
    current_epoch: int
    pending_epoch: int
    finalized_epoch: int
    current_epoch_context: CurrentEpochContext = None
    pending_epoch_context: PendingEpochContext = None
    finalized_epoch_context: FinalizedEpochContext = None
    users_context: Dict[str, User] = None
    future_epoch_details: EpochDetails = None


class ContextBuilder:
    def __init__(self):
        current_epoch = epochs.get_current_epoch()
        pending_epoch = epochs.get_pending_epoch()
        finalized_epoch = epochs.get_finalized_epoch()
        self.context = Context(
            current_epoch=current_epoch,
            pending_epoch=pending_epoch,
            finalized_epoch=finalized_epoch,
        )

    def with_current_epoch_context(self):
        epoch_settings = get_epoch_settings(self.context.current_epoch)
        epoch_details = epoch.get_epoch_details(self.context.current_epoch)
        self.context.current_epoch_context = CurrentEpochContext(
            epoch_settings=epoch_settings, epoch_details=epoch_details
        )
        return self

    def with_pending_epoch_context(self):
        epoch_settings = get_epoch_settings(self.context.pending_epoch)
        epoch_details = epoch.get_epoch_details(self.context.pending_epoch)
        pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(
            self.context.pending_epoch
        )
        self.context.pending_epoch_context = PendingEpochContext(
            epoch_settings=epoch_settings,
            epoch_details=epoch_details,
            pending_snapshot=pending_snapshot,
        )
        return self

    def with_finalized_epoch_context(self):
        epoch_settings = get_epoch_settings(self.context.finalized_epoch)
        epoch_details = epoch.get_epoch_details(self.context.finalized_epoch)
        finalized_snapshot = database.finalized_epoch_snapshot.get_by_epoch(
            self.context.finalized_epoch
        )
        self.context.finalized_epoch_context = FinalizedEpochContext(
            epoch_settings=epoch_settings,
            epoch_details=epoch_details,
            finalized_snapshot=finalized_snapshot,
        )
        return self

    def with_users_context(self, users_addresses: List[str]):
        users_context = database.user.get_by_users_addresses(users_addresses)
        self.context.users_context = users_context
        return self

    def with_future_epoch_context(self):
        epoch_details = epoch.get_future_epoch_details()
        self.context.future_epoch_context = epoch_details
        return self

    def build(self) -> Context:
        return self.context

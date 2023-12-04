from dataclasses import dataclass
from typing import Optional, List, Dict

from app import EpochsRegistry
from app.database import (
    pending_epoch_snapshot,
    finalized_epoch_snapshot,
    user as user_db,
)
from app.database.models import PendingEpochSnapshot, FinalizedEpochSnapshot, User
from app.exceptions import InvalidEpoch
from app.extensions import epochs
from app.v2.engine.epochs_settings import EpochSettings


@dataclass(frozen=True)
class CurrentEpochContext:
    epoch_settings: EpochSettings


@dataclass(frozen=True)
class PendingEpochContext:
    epoch_settings: EpochSettings
    pending_snapshot: PendingEpochSnapshot = None
    users_context: Optional[Dict[str, User]] = None


@dataclass(frozen=True)
class FinalizedEpochContext:
    epoch_settings: EpochSettings
    finalized_snapshot: FinalizedEpochSnapshot = None


@dataclass
class Context:
    current_epoch: int
    pending_epoch: int
    finalized_epoch: int
    current_epoch_context: CurrentEpochContext = None
    pending_epoch_context: PendingEpochContext = None
    finalized_epoch_context: FinalizedEpochContext = None


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
        epoch_settings = EpochsRegistry.get_epoch_settings(self.context.current_epoch)
        self.context.current_epoch_context = CurrentEpochContext(
            epoch_settings=epoch_settings
        )
        return self

    def with_pending_epoch_context(self, users_addresses: List[str] = None):
        epoch_settings = EpochsRegistry.get_epoch_settings(self.context.pending_epoch)
        try:
            pending_snapshot = pending_epoch_snapshot.get_by_epoch_num(
                self.context.pending_epoch
            )
        except InvalidEpoch:
            pending_snapshot = None
        users_context = None

        if users_addresses is not None:
            users_context = user_db.get_by_users_addresses(users_addresses)

        self.context.pending_epoch_context = PendingEpochContext(
            epoch_settings=epoch_settings,
            pending_snapshot=pending_snapshot,
            users_context=users_context,
        )
        return self

    def with_finalized_epoch_context(self):
        epoch_settings = EpochsRegistry.get_epoch_settings(self.context.finalized_epoch)
        try:
            finalized_snapshot = finalized_epoch_snapshot.get_by_epoch_num(
                self.context.finalized_epoch
            )
        except InvalidEpoch:
            finalized_snapshot = None
        self.context.finalized_epoch_context = FinalizedEpochContext(
            epoch_settings=epoch_settings, finalized_snapshot=finalized_snapshot
        )
        return self

    def build(self) -> Context:
        return self.context

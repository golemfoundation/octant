from dataclasses import dataclass
from typing import Optional, List

from app import EpochsRegistry
from app.core.epochs.epochs_registry import EpochSettings
from app.database import (
    pending_epoch_snapshot,
    finalized_epoch_snapshot,
    user as user_db,
    deposits,
)
from app.database.models import PendingEpochSnapshot, FinalizedEpochSnapshot, User
from app.extensions import epochs


@dataclass(frozen=True)
class UserContext:
    user: Optional[User]
    user_effective_deposit: Optional[int]
    user_budget: Optional[int]


@dataclass(frozen=True)
class CurrentEpochContext:
    epoch_settings: EpochSettings


@dataclass(frozen=True)
class PendingEpochContext:
    epoch_settings: EpochSettings
    pending_snapshot: PendingEpochSnapshot = None
    users_context: Optional[List[UserContext]] = None


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
        pending_snapshot = pending_epoch_snapshot.get_by_epoch_num(
            self.context.pending_epoch
        )
        users_context = []

        if users_addresses is not None:
            for address in users_addresses:
                user_effective_deposit = None
                user_budget = None
                user = user_db.get_by_address(address)
                if user is not None:
                    user_effective_deposit = deposits.get_by_user_address_and_epoch(
                        address, self.context.pending_epoch
                    )
                users_context.append(
                    UserContext(
                        user=user,
                        user_effective_deposit=user_effective_deposit,
                        user_budget=user_budget,
                    )
                )

        self.context.pending_epoch_context = PendingEpochContext(
            epoch_settings=epoch_settings,
            pending_snapshot=pending_snapshot,
            users_context=users_context,
        )
        return self

    def with_finalized_epoch_context(self):
        epoch_settings = EpochsRegistry.get_epoch_settings(self.context.finalized_epoch)
        finalized_snapshot = finalized_epoch_snapshot.get_by_epoch_num(
            self.context.finalized_epoch
        )
        self.context.finalized_epoch_context = FinalizedEpochContext(
            epoch_settings=epoch_settings, finalized_snapshot=finalized_snapshot
        )
        return self

    def build(self) -> Context:
        return self.context

from typing import List

from app import database
from app.exceptions import SnapshotAlreadyExists
from app.extensions import epochs
from app.v2.context import epoch
from app.v2.context.context import (
    Context,
    CurrentEpochContext,
    PendingEpochContext,
    FinalizedEpochContext,
    FutureEpochContext,
    EpochContext, PrePendingEpochContext,
)
from app.v2.engine.epochs_settings import get_epoch_settings
from app.v2.modules.octant_rewards.service.factory import get_octant_rewards_service


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

    def with_epoch_context(self, epoch_num: int):
        epoch_settings = get_epoch_settings(epoch_num)
        epoch_details = epoch.get_epoch_details(epoch_num)
        self.context.epoch_context = EpochContext(
            epoch_num=epoch_num,
            epoch_settings=epoch_settings,
            epoch_details=epoch_details,
        )
        return self

    def with_current_epoch_context(self):
        epoch_settings = get_epoch_settings(self.context.current_epoch)
        epoch_details = epoch.get_epoch_details(self.context.current_epoch)
        self.context.current_epoch_context = CurrentEpochContext(
            epoch_num=self.context.current_epoch,
            epoch_settings=epoch_settings,
            epoch_details=epoch_details,
        )
        return self

    def with_pending_epoch_context(self):
        epoch_settings = get_epoch_settings(self.context.pending_epoch)
        epoch_details = epoch.get_epoch_details(self.context.pending_epoch)
        self.context.pending_epoch_context = PendingEpochContext(
            epoch_num=self.context.pending_epoch,
            epoch_settings=epoch_settings,
            epoch_details=epoch_details,
        )
        return self

    def with_pre_pending_epoch_context(self):
        snapshot = database.pending_epoch_snapshot.get_by_epoch(
            self.context.pending_epoch
        )

        if snapshot is not None:
            raise SnapshotAlreadyExists()

        epoch_settings = get_epoch_settings(self.context.pending_epoch)
        epoch_details = epoch.get_epoch_details(self.context.pending_epoch)
        self.context.pending_epoch_context = PrePendingEpochContext(
            epoch_num=self.context.pending_epoch,
            epoch_settings=epoch_settings,
            epoch_details=epoch_details,
        )
        return self

    def with_finalized_epoch_context(self):
        epoch_settings = get_epoch_settings(self.context.finalized_epoch)
        epoch_details = epoch.get_epoch_details(self.context.finalized_epoch)
        finalized_snapshot = database.finalized_epoch_snapshot.get_by_epoch(
            self.context.finalized_epoch
        )
        self.context.finalized_epoch_context = FinalizedEpochContext(
            epoch_num=self.context.finalized_epoch,
            epoch_settings=epoch_settings,
            epoch_details=epoch_details,
            finalized_snapshot=finalized_snapshot,
        )
        return self

    def with_future_epoch_context(self):
        # TODO We assume that there is only one strategy for all upcoming epochs. Using a proper strategy for the future epochs will be handled in this task: https://linear.app/golemfoundation/issue/OCT-943/prepare-a-budget-calculator-for-different-rewards-strategies-in-the
        epoch_settings = get_epoch_settings(self.context.current_epoch + 1)
        epoch_details = epoch.get_future_epoch_details()
        self.context.future_epoch_context = FutureEpochContext(
            epoch_num=self.context.current_epoch + 1,
            epoch_settings=epoch_settings,
            epoch_details=epoch_details,
        )
        return self

    def with_users(self, users_addresses: List[str]):
        users_context = database.user.get_by_users_addresses(users_addresses)
        self.context.users_context = users_context
        return self

    def with_octant_rewards(self):
        if self.context.finalized_epoch_context is not None:
            service = get_octant_rewards_service(self.context.finalized_epoch_context)
            rewards = service.get_octant_rewards(self.context.finalized_epoch_context)
            self.context.finalized_epoch_context.octant_rewards = rewards

        if self.context.pending_epoch_context is not None:
            service = get_octant_rewards_service(self.context.pending_epoch_context)
            rewards = service.get_octant_rewards(self.context.pending_epoch_context)
            self.context.pending_epoch_context.octant_rewards = rewards

        if self.context.pre_pending_epoch_context is not None:
            service = get_octant_rewards_service(self.context.pre_pending_epoch_context)
            rewards = service.get_octant_rewards(self.context.pre_pending_epoch_context)
            self.context.pre_pending_epoch_context.octant_rewards = rewards

        if self.context.current_epoch_context is not None:
            service = get_octant_rewards_service(self.context.current_epoch_context)
            rewards = service.get_octant_rewards(self.context.current_epoch_context)
            self.context.current_epoch_context.octant_rewards = rewards

        if self.context.future_epoch_context is not None:
            service = get_octant_rewards_service(self.context.future_epoch_context)
            rewards = service.get_octant_rewards(self.context.future_epoch_context)
            self.context.future_epoch_context.octant_rewards = rewards
        return self

    def build(self) -> Context:
        return self.context

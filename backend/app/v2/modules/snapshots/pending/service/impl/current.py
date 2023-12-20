from abc import abstractmethod
from dataclasses import dataclass
from typing import Optional

from app.v2.context.context import EpochContext
from app.v2.modules.snapshots.pending.service.impl.pre_pending import (
    PrePendingSnapshotsService,
)


@dataclass
class CurrentSnapshotsService(PrePendingSnapshotsService):
    @abstractmethod
    def create_pending_epoch_snapshot(self, context: EpochContext) -> Optional[int]:
        raise NotImplementedError

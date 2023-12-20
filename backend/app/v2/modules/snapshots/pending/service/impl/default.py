from abc import abstractmethod
from dataclasses import dataclass
from typing import Optional

from app.v2.context.context import EpochContext
from app.v2.modules.snapshots.pending.api import SnapshotsService


@dataclass
class DefaultSnapshotsService(SnapshotsService):
    @abstractmethod
    def create_pending_epoch_snapshot(self, context: EpochContext) -> Optional[int]:
        raise NotImplementedError

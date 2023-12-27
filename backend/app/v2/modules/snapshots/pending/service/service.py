from typing import Optional, Protocol

from app.v2.context.context import Context


class SnapshotsService(Protocol):
    def create_pending_epoch_snapshot(self, context: Context) -> Optional[int]:
        ...

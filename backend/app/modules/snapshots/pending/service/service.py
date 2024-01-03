from typing import Protocol

from app.context.context import Context


class SnapshotsService(Protocol):
    def create_pending_epoch_snapshot(self, context: Context) -> int:
        ...

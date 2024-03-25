from app.modules.dto import PendingSnapshotDTO
from app.context.manager import Context
from app.modules.snapshots.pending.service.base import BasePrePendingSnapshots


class SimulatedPendingSnapshots(BasePrePendingSnapshots):
    def simulate_pending_epoch_snapshot(self, context: Context) -> PendingSnapshotDTO:
        return self._calculate_pending_epoch_snapshot(context)

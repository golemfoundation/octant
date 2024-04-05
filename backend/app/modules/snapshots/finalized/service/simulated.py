from app.context.manager import Context
from app.modules.dto import FinalizedSnapshotDTO
from app.modules.snapshots.finalized.service.base import BaseFinalizedSnapshots


class SimulatedFinalizedSnapshots(BaseFinalizedSnapshots):
    def simulate_finalized_epoch_snapshot(
        self, context: Context
    ) -> FinalizedSnapshotDTO:
        return self._calculate_finalized_epoch_snapshot(context)

from typing import Optional

from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.exceptions import InvalidEpoch
from app.modules.dto import PendingSnapshotDTO
from app.modules.modules_factory.pre_pending import PrePendingServices
from app.modules.registry import get_services
from app.modules.modules_factory.current import CurrentServices


def create_pending_epoch_snapshot() -> Optional[int]:
    try:
        context = state_context(EpochState.PRE_PENDING, with_block_range=True)
    except InvalidEpoch:
        return None
    services: PrePendingServices = get_services(EpochState.PRE_PENDING)
    return services.pending_snapshots_service.create_pending_epoch_snapshot(context)


def simulate_pending_epoch_snapshot() -> PendingSnapshotDTO | None:
    context = state_context(EpochState.SIMULATED, with_block_range=True)
    services: CurrentServices = get_services(EpochState.CURRENT)

    return services.simulated_pending_snapshot_service.simulate_pending_epoch_snapshot(
        context
    )

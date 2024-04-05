from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.exceptions import InvalidEpoch
from app.modules.dto import FinalizedSnapshotDTO
from app.modules.modules_factory.finalizing import FinalizingServices
from app.modules.registry import get_services


def create_finalized_epoch_snapshot() -> int | None:
    try:
        context = state_context(EpochState.FINALIZING)
    except InvalidEpoch:
        return None
    services: FinalizingServices = get_services(EpochState.FINALIZING)
    return services.finalized_snapshots_service.create_finalized_epoch_snapshot(context)


def simulate_finalized_epoch_snapshot() -> FinalizedSnapshotDTO | None:
    context = state_context(EpochState.PENDING)
    services = get_services(EpochState.PENDING)
    return services.finalized_snapshots_service.simulate_finalized_epoch_snapshot(
        context
    )

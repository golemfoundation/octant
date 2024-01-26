from app.context.epoch_state import EpochState
from app.context.manager import state_context, Context
from app.exceptions import InvalidEpoch
from app.modules.dto import FinalizedSnapshotDTO
from app.modules.modules_factory.pending import PendingServices
from app.modules.registry import get_services


def simulate_finalized_epoch_snapshot() -> FinalizedSnapshotDTO | None:
    context = _get_simulate_context()
    services: PendingServices = get_services(EpochState.PENDING)
    return services.finalized_snapshots_service.simulate_finalized_epoch_snapshot(
        context
    )


def _get_simulate_context() -> Context:
    try:
        return state_context(EpochState.PENDING)
    except InvalidEpoch:
        pass  # Fallback to FINALIZING
    return state_context(EpochState.FINALIZING)

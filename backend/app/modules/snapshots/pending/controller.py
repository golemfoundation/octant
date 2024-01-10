from typing import Optional

from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.exceptions import InvalidEpoch
from app.modules.modules_factory.pre_pending import PrePendingServices
from app.modules.registry import get_services


def create_pending_epoch_snapshot() -> Optional[int]:
    try:
        context = state_context(EpochState.PRE_PENDING)
    except InvalidEpoch:
        return None
    services: PrePendingServices = get_services(EpochState.PRE_PENDING)
    return services.snapshots_service.create_pending_epoch_snapshot(context)

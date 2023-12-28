from typing import Optional

from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.modules.registry import get_services


def create_pending_epoch_snapshot() -> Optional[int]:
    context = state_context(EpochState.PRE_PENDING)
    service = get_services(EpochState.PRE_PENDING).snapshots_service
    return service.create_pending_epoch_snapshot(context)

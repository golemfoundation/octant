from typing import Optional

from app.v2.context.builder import ContextBuilder
from app.v2.modules.snapshots.pending.service.factory import get_snapshots_service


def create_pending_epoch_snapshot() -> Optional[int]:
    context = (
        ContextBuilder().with_pre_pending_epoch_context().with_octant_rewards().build()
    )
    service = get_snapshots_service(context.pre_pending_epoch_context)
    return service.create_pending_epoch_snapshot(context.pre_pending_epoch_context)

from app.v2.context.context import (
    EpochContext,
    CurrentEpochContext,
    FutureEpochContext,
    PrePendingEpochContext,
    PendingEpochContext,
    FinalizedEpochContext,
    PreFinalizedEpochContext,
)
from app.v2.modules.snapshots.pending.api import SnapshotsService
from app.v2.modules.snapshots.pending.service.impl.current import (
    CurrentSnapshotsService,
)
from app.v2.modules.snapshots.pending.service.impl.default import (
    DefaultSnapshotsService,
)
from app.v2.modules.snapshots.pending.service.impl.pre_pending import (
    PrePendingSnapshotsService,
)
from app.v2.modules.user.deposits.service.factory import get_user_deposits_service


def get_snapshots_service(context: EpochContext) -> SnapshotsService:
    if isinstance(context, FutureEpochContext):
        pass
    elif isinstance(context, CurrentEpochContext):
        return CurrentSnapshotsService()
    elif isinstance(context, PrePendingEpochContext):
        user_deposits_service = get_user_deposits_service(context)
        return PrePendingSnapshotsService(user_deposits_service)
    elif isinstance(context, PendingEpochContext):
        pass
    elif isinstance(context, PreFinalizedEpochContext):
        pass
    elif isinstance(context, FinalizedEpochContext):
        pass
    elif isinstance(context, EpochContext):
        return DefaultSnapshotsService()
    else:
        raise NotImplementedError

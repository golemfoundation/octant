from app.v2.context.context import (
    EpochContext,
    CurrentEpochContext,
    FutureEpochContext,
    PrePendingEpochContext,
    PendingEpochContext,
    FinalizedEpochContext,
    PreFinalizedEpochContext,
)
from app.v2.modules.staking.proceeds.api import StakingProceedsService
from app.v2.modules.staking.proceeds.service.impl.current import (
    CurrentStakingProceedsService,
)
from app.v2.modules.staking.proceeds.service.impl.default import (
    DefaultStakingProceedsService,
)
from app.v2.modules.staking.proceeds.service.impl.pre_pending import (
    PrePendingStakingProceedsService,
)


def get_staking_proceeds_service(context: EpochContext) -> StakingProceedsService:
    if isinstance(context, FutureEpochContext):
        pass
    elif isinstance(context, CurrentEpochContext):
        return CurrentStakingProceedsService()
    elif isinstance(context, PrePendingEpochContext):
        return PrePendingStakingProceedsService()
    elif isinstance(context, PendingEpochContext):
        pass
    elif isinstance(context, PreFinalizedEpochContext):
        pass
    elif isinstance(context, FinalizedEpochContext):
        pass
    elif isinstance(context, EpochContext):
        return DefaultStakingProceedsService()
    else:
        raise NotImplementedError

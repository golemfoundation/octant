from app.v2.context.context import (
    EpochContext,
    CurrentEpochContext,
    FutureEpochContext,
    PrePendingEpochContext,
    PendingEpochContext,
    FinalizedEpochContext,
    PreFinalizedEpochContext,
)
from app.v2.modules.octant_rewards.api import OctantRewardsService
from app.v2.modules.octant_rewards.service.impl.default import (
    DefaultOctantRewardsService,
)
from app.v2.modules.octant_rewards.service.impl.pre_pending import (
    PrePendingOctantRewardsService,
)
from app.v2.modules.staking.proceeds.service.factory import get_staking_proceeds_service
from app.v2.modules.user.deposits.service.factory import get_user_deposits_service


def get_octant_rewards_service(context: EpochContext) -> OctantRewardsService:
    if isinstance(context, FutureEpochContext):
        pass
    elif isinstance(context, CurrentEpochContext):
        pass
    elif isinstance(context, PrePendingEpochContext):
        staking_proceeds_service = get_staking_proceeds_service(context)
        user_deposits_service = get_user_deposits_service(context)
        return PrePendingOctantRewardsService(
            staking_proceeds_service, user_deposits_service
        )
    elif isinstance(context, PendingEpochContext):
        pass
    elif isinstance(context, PreFinalizedEpochContext):
        pass
    elif isinstance(context, FinalizedEpochContext):
        pass
    elif isinstance(context, EpochContext):
        return DefaultOctantRewardsService()
    else:
        raise NotImplementedError

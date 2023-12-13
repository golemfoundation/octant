from typing import Optional

from app.context.context import ContextBuilder
from app.core.deposits.events import EventGenerator
from app.v2.modules.octant_rewards.service.octant_rewards import OctantRewardsService
from app.v2.modules.snapshots.service.pending_snapshot import PendingSnapshotsService
from app.v2.modules.staking.service.proceeds import StakingProceedsService
from app.v2.modules.user.service.deposits import UserDepositsService


def snapshot_pending_epoch() -> Optional[int]:
    context = ContextBuilder().with_pending_epoch_context().build()
    start = context.pending_epoch_context.epoch_details.start_sec
    end = context.pending_epoch_context.epoch_details.end_sec

    event_generator = EventGenerator(epoch_start=start, epoch_end=end)
    user_deposits_service = UserDepositsService(event_generator)
    staking_proceeds_service = StakingProceedsService()
    octant_rewards_service = OctantRewardsService(staking_proceeds_service)

    snapshots_service = PendingSnapshotsService(
        user_deposits_service=user_deposits_service,
        octant_rewards_service=octant_rewards_service,
    )

    return snapshots_service.snapshot_pending_epoch(
        context.pending_epoch, context.pending_epoch_context
    )

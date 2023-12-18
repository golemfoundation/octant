from typing import Optional

from app.v2.context.builder import ContextBuilder
from app.v2.modules.octant_rewards.service import OctantRewardsCalculator
from app.v2.modules.snapshots.pending.service import PendingSnapshotsCreator
from app.v2.modules.staking.proceeds.service import WithdrawalsTargetStakingProceeds
from app.v2.modules.user.budgets.service import (
    UserBudgetsCalculator,
)
from app.v2.modules.user.deposits.events_generator import (
    SubgraphEventsGenerator,
)
from app.v2.modules.user.deposits.service import (
    UserDepositsCalculator,
)


def snapshot_pending_epoch() -> Optional[int]:
    context = (
        ContextBuilder().with_pending_epoch_context().with_octant_rewards().build()
    )
    start = context.pending_epoch_context.epoch_details.start_sec
    end = context.pending_epoch_context.epoch_details.end_sec

    event_generator = SubgraphEventsGenerator(epoch_start=start, epoch_end=end)
    user_deposits_calculator = UserDepositsCalculator(event_generator)
    user_budgets_calculator = UserBudgetsCalculator()
    staking_proceeds_calculator = WithdrawalsTargetStakingProceeds()
    octant_rewards_calculator = OctantRewardsCalculator()
    pending_snapshots_creator = PendingSnapshotsCreator(
        user_deposits_calculator=user_deposits_calculator,
        user_budgets_calculator=user_budgets_calculator,
        octant_rewards_calculator=octant_rewards_calculator,
        staking_proceeds_calculator=staking_proceeds_calculator,
    )

    return pending_snapshots_creator.snapshot_pending_epoch(
        context.pending_epoch, context.pending_epoch_context
    )

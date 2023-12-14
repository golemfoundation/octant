from typing import Optional

from app.context.context import ContextBuilder
from app.core.deposits.events import EventGenerator
from app.v2.modules.octant_rewards.service import OctantRewardsCalculator
from app.v2.modules.snapshots.pending.service import PendingSnapshotsCreator
from app.v2.modules.staking.proceeds.service import StakingBalanceReader
from app.v2.modules.user.budgets.service import (
    UserBudgetsCalculator,
    UserBudgetsCreator,
)
from app.v2.modules.user.deposits.service import (
    UserDepositsCalculator,
    UserDepositsCreator,
)


def snapshot_pending_epoch() -> Optional[int]:
    context = ContextBuilder().with_pending_epoch_context().build()
    start = context.pending_epoch_context.epoch_details.start_sec
    end = context.pending_epoch_context.epoch_details.end_sec

    event_generator = EventGenerator(epoch_start=start, epoch_end=end)
    user_deposits_calculator = UserDepositsCalculator(event_generator)
    user_deposits_creator = UserDepositsCreator()
    user_budgets_calculator = UserBudgetsCalculator()
    user_budgets_creator = UserBudgetsCreator()
    staking_balance_reader = StakingBalanceReader()
    octant_rewards_calculator = OctantRewardsCalculator(staking_balance_reader)

    pending_snapshots_creator = PendingSnapshotsCreator(
        user_deposits_calculator=user_deposits_calculator,
        user_deposits_creator=user_deposits_creator,
        user_budgets_calculator=user_budgets_calculator,
        user_budgets_creator=user_budgets_creator,
        octant_rewards_calculator=octant_rewards_calculator,
    )

    return pending_snapshots_creator.snapshot_pending_epoch(
        context.pending_epoch, context.pending_epoch_context
    )

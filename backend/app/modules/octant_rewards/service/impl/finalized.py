from dataclasses import dataclass
from decimal import Decimal

from app.context.context import Context
from app.infrastructure import database
from app.modules.octant_rewards.service.service import OctantRewards


@dataclass
class FinalizedOctantRewards:
    def get_octant_rewards(self, context: Context) -> OctantRewards:
        pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )
        finalized_snapshot = database.finalized_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )

        return OctantRewards(
            staking_proceeds=int(pending_snapshot.eth_proceeds),
            locked_ratio=Decimal(pending_snapshot.locked_ratio),
            total_effective_deposit=int(pending_snapshot.total_effective_deposit),
            total_rewards=int(pending_snapshot.total_rewards),
            individual_rewards=int(pending_snapshot.all_individual_rewards),
            operational_cost=int(pending_snapshot.operational_cost),
            patrons_rewards=int(finalized_snapshot.patrons_rewards),
            matched_rewards=int(finalized_snapshot.matched_rewards),
            leftover=int(finalized_snapshot.leftover),
            total_withdrawals=int(finalized_snapshot.total_withdrawals),
        )

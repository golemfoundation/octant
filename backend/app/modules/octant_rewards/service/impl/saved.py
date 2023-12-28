from dataclasses import dataclass

from app.exceptions import MissingSnapshot
from app.context.context import Context
from app.infrastructure import database
from app.modules.octant_rewards.service.service import OctantRewards


@dataclass
class SavedOctantRewards:
    def get_octant_rewards(self, context: Context) -> OctantRewards:
        snapshot = database.pending_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )
        if snapshot is None:
            raise MissingSnapshot()

        return OctantRewards(
            eth_proceeds=snapshot.eth_proceeds,
            locked_ratio=snapshot.locked_ratio,
            total_effective_deposit=snapshot.total_effective_deposit,
            total_rewards=snapshot.total_rewards,
            individual_rewards=snapshot.all_individual_rewards,
        )

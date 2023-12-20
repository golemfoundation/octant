from dataclasses import dataclass

from app import database
from app.exceptions import MissingSnapshot
from app.v2.context.context import EpochContext
from app.v2.modules.octant_rewards.api import OctantRewardsService, OctantRewards


@dataclass
class DefaultOctantRewardsService(OctantRewardsService):
    def get_octant_rewards(self, context: EpochContext) -> OctantRewards:
        snapshot = database.pending_epoch_snapshot.get_by_epoch(context.epoch_num)
        if snapshot is None:
            raise MissingSnapshot()

        return OctantRewards(
            eth_proceeds=snapshot.eth_proceeds,
            locked_ratio=snapshot.locked_ratio,
            total_effective_deposit=snapshot.total_effective_deposit,
            total_rewards=snapshot.total_rewards,
            individual_rewards=snapshot.all_individual_rewards,
        )

from app.extensions import db

from app.infrastructure.routes.snapshots import PendingEpochSnapshot
from app.v2.modules.octant_rewards.service.octant_rewards import OctantRewardsDTO


def save_snapshot(
    epoch: int, rewards_dto: OctantRewardsDTO, total_effective_deposit: int
):
    snapshot = PendingEpochSnapshot(
        epoch=epoch,
        eth_proceeds=str(rewards_dto.eth_proceeds),
        total_effective_deposit=str(total_effective_deposit),
        locked_ratio="{:f}".format(rewards_dto.locked_ratio),
        total_rewards=str(rewards_dto.total_rewards),
        all_individual_rewards=str(rewards_dto.all_individual_rewards),
    )
    db.session.add(snapshot)

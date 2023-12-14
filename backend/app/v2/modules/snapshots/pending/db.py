from sqlalchemy import desc

from app.database.models import PendingEpochSnapshot
from app.extensions import db
from app.v2.modules.octant_rewards.service import OctantRewardsDTO


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


def get_last_snapshot() -> PendingEpochSnapshot:
    return (
        db.session.query(PendingEpochSnapshot)
        .order_by(desc(PendingEpochSnapshot.epoch))
        .first()
    )

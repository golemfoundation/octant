from typing import List

from eth_utils import to_checksum_address

from app import db
from app.database.models import Reward as RewardDB


def get_by_epoch(epoch: int) -> List[RewardDB]:
    return RewardDB.query.filter_by(epoch=epoch).order_by(RewardDB.address.asc()).all()


def add_all(epoch: int, rewards):
    new_rewards = [
        RewardDB(
            epoch=epoch,
            address=to_checksum_address(r.address),
            amount=str(r.amount),
        )
        for r in rewards
    ]
    db.session.add_all(new_rewards)

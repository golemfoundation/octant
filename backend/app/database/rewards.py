from typing import List

from eth_utils import to_checksum_address

from app import db
from app.core.common import AddressAndAmount
from app.database.models import Reward as RewardDB


def get_by_epoch(epoch: int) -> List[RewardDB]:
    return RewardDB.query.filter_by(epoch=epoch).order_by(RewardDB.address.asc()).all()


def get_by_address_and_epoch_gt(address: str, epoch: int) -> List[RewardDB]:
    return (
        RewardDB.query.filter(
            RewardDB.address == to_checksum_address(address), RewardDB.epoch > epoch
        )
        .order_by(RewardDB.epoch.asc())
        .all()
    )


def add(epoch: int, address: str, amount: int):
    db.session.add(
        RewardDB(
            epoch=epoch,
            address=to_checksum_address(address),
            amount=str(amount),
        )
    )


def add_all(epoch: int, rewards: List[AddressAndAmount]):
    new_rewards = [
        RewardDB(
            epoch=epoch,
            address=to_checksum_address(r.address),
            amount=str(r.amount),
        )
        for r in rewards
    ]
    db.session.add_all(new_rewards)

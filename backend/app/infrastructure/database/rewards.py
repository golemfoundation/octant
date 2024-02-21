from typing import List

from eth_utils import to_checksum_address

from app import db
from app.legacy.core.common import AccountFunds
from app.infrastructure.database.models import Reward as RewardDB


def get_by_epoch(epoch: int) -> List[RewardDB]:
    return RewardDB.query.filter_by(epoch=epoch).order_by(RewardDB.address.asc()).all()


def get_by_epoch_and_address_list(
    epoch: int, address_list: List[str]
) -> List[RewardDB]:
    return (
        RewardDB.query.filter(
            RewardDB.epoch == epoch, RewardDB.address.in_(address_list)
        )
        .order_by(RewardDB.address.asc())
        .all()
    )


def get_by_address_and_epoch_gt(address: str, epoch: int) -> List[RewardDB]:
    return (
        RewardDB.query.filter(
            RewardDB.address == to_checksum_address(address), RewardDB.epoch > epoch
        )
        .order_by(RewardDB.epoch.asc())
        .all()
    )


def add_proposal_reward(epoch: int, address: str, amount: int, matched: int):
    db.session.add(
        RewardDB(
            epoch=epoch,
            address=to_checksum_address(address),
            amount=str(amount),
            matched=str(matched),
        )
    )


def add_user_reward(epoch: int, address: str, amount: int):
    db.session.add(
        RewardDB(
            epoch=epoch,
            address=to_checksum_address(address),
            amount=str(amount),
        )
    )


def add_all(epoch: int, rewards: List[AccountFunds]):
    new_rewards = [
        RewardDB(
            epoch=epoch,
            address=to_checksum_address(r.address),
            amount=str(r.amount),
            matched=str(r.matched) if r.matched is not None else None,
        )
        for r in rewards
    ]
    db.session.add_all(new_rewards)

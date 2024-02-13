from dataclasses import dataclass
from enum import StrEnum
from typing import List

from app.extensions import vault, epochs
from app.infrastructure import database
from app.infrastructure.graphql.merkle_roots import get_all_vault_merkle_roots
from app.legacy.core.merkle_tree import get_proof_by_address_and_epoch
from app.legacy.core.user.rewards import get_user_claimed_rewards


class WithdrawalStatus(StrEnum):
    PENDING = "pending"
    AVAILABLE = "available"


@dataclass(frozen=True)
class WithdrawableEth:
    epoch: int
    amount: int
    proof: List[str]
    status: WithdrawalStatus


def get_withdrawable_eth(address: str) -> List[WithdrawableEth]:
    pending_epoch = epochs.get_pending_epoch()
    last_claimed_epoch = vault.get_last_claimed_epoch(address)
    rewards = database.rewards.get_by_address_and_epoch_gt(address, last_claimed_epoch)
    merkle_roots_epochs = [mr["epoch"] for mr in get_all_vault_merkle_roots()]

    withdrawable_eth = []

    if pending_epoch is not None:
        pending_rewards = get_user_claimed_rewards(address, pending_epoch)
        withdrawable_eth.append(
            WithdrawableEth(
                pending_epoch, pending_rewards, [], WithdrawalStatus.PENDING
            )
        )

    for r in rewards:
        status = (
            WithdrawalStatus.AVAILABLE
            if r.epoch in merkle_roots_epochs
            else WithdrawalStatus.PENDING
        )
        withdrawable_eth.append(
            WithdrawableEth(
                r.epoch,
                int(r.amount),
                get_proof_by_address_and_epoch(address, r.epoch),
                status,
            )
        )

    return withdrawable_eth

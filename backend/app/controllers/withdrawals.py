from dataclasses import dataclass
from typing import List

from app import database
from app.contracts.vault import vault
from app.core.merkle_tree import get_proof_by_address_and_epoch


@dataclass(frozen=True)
class WithdrawableEth:
    epoch: int
    amount: int
    proof: List[str]


def get_withdrawable_eth(address: str) -> List[WithdrawableEth]:
    last_claimed_epoch = vault.get_last_claimed_epoch(address)
    rewards = database.rewards.get_by_address_and_epoch_gt(address, last_claimed_epoch)

    return [
        WithdrawableEth(
            r.epoch, r.amount, get_proof_by_address_and_epoch(address, r.epoch)
        )
        for r in rewards
    ]

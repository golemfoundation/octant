from multiproof import StandardMerkleTree

from app.context.manager import Context
from app.infrastructure.database.models import Reward
from app.modules.common.merkle_tree import get_proof
from app.modules.dto import WithdrawableEth, WithdrawalStatus


def get_withdrawals(
    context: Context,
    address: str,
    pending_epoch_rewards: int,
    finalized_epoch_rewards: list[Reward],
    merkle_trees: dict[int, StandardMerkleTree],
    merkle_roots_epochs: list[int],
) -> list[WithdrawableEth]:
    withdrawable_eth = []

    if pending_epoch_rewards:
        pending_epoch_withdrawal = _create_pending_epoch_withdrawal(
            context.epoch_details.epoch_num, pending_epoch_rewards
        )
        withdrawable_eth.append(pending_epoch_withdrawal)

    finalized_epochs_withdrawals = create_finalized_epoch_withdrawals(
        finalized_epoch_rewards, merkle_trees, merkle_roots_epochs, address
    )
    withdrawable_eth.extend(finalized_epochs_withdrawals)

    return withdrawable_eth


def create_finalized_epoch_withdrawals(
    rewards: list[Reward],
    merkle_trees: dict[int, StandardMerkleTree],
    merkle_roots_epochs: list[int],
    address: str,
) -> list[WithdrawableEth]:
    withdrawable_eth = []

    for r in rewards:
        merkle_tree = merkle_trees[r.epoch]
        status = (
            WithdrawalStatus.AVAILABLE
            if r.epoch in merkle_roots_epochs
            else WithdrawalStatus.PENDING
        )
        withdrawable_eth.append(
            WithdrawableEth(
                r.epoch,
                int(r.amount),
                get_proof(merkle_tree, address),
                status,
            )
        )

    return withdrawable_eth


def _create_pending_epoch_withdrawal(epoch_num: int, user_rewards: int):
    return WithdrawableEth(epoch_num, user_rewards, [], WithdrawalStatus.PENDING)

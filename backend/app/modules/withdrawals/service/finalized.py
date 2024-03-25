from app.context.manager import Context
from app.extensions import vault
from app.infrastructure import database
from app.infrastructure.graphql.merkle_roots import get_all_vault_merkle_roots
from app.modules.common.merkle_tree import get_rewards_merkle_tree_for_epoch
from app.modules.dto import WithdrawableEth
from app.modules.withdrawals.core import create_finalized_epoch_withdrawals
from app.pydantic import Model


class FinalizedWithdrawals(Model):
    def get_withdrawable_eth(self, _: Context, address: str) -> list[WithdrawableEth]:
        last_claimed_epoch = vault.get_last_claimed_epoch(address)
        rewards = database.rewards.get_by_address_and_epoch_gt(
            address, last_claimed_epoch
        )
        merkle_trees = {
            r.epoch: get_rewards_merkle_tree_for_epoch(r.epoch) for r in rewards
        }
        merkle_roots_epochs = [mr["epoch"] for mr in get_all_vault_merkle_roots()]

        return create_finalized_epoch_withdrawals(
            rewards, merkle_trees, merkle_roots_epochs, address
        )

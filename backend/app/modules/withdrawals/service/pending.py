from typing import runtime_checkable, Protocol

from app.context.manager import Context
from app.extensions import vault
from app.infrastructure import database
from app.infrastructure.graphql.merkle_roots import get_all_vault_merkle_roots
from app.modules.common.merkle_tree import get_rewards_merkle_tree_for_epoch
from app.modules.dto import WithdrawableEth
from app.modules.withdrawals.core import (
    get_withdrawals,
)
from app.pydantic import Model


@runtime_checkable
class UserRewards(Protocol):
    def get_user_claimed_rewards(self, context: Context, user_address: str) -> int:
        ...


class PendingWithdrawals(Model):
    user_rewards: UserRewards

    def get_withdrawable_eth(
        self, context: Context, address: str
    ) -> list[WithdrawableEth]:
        last_claimed_epoch = vault.get_last_claimed_epoch(address)
        rewards = database.rewards.get_by_address_and_epoch_gt(
            address, last_claimed_epoch
        )
        merkle_trees = {
            r.epoch: get_rewards_merkle_tree_for_epoch(r.epoch) for r in rewards
        }
        merkle_roots_epochs = [mr["epoch"] for mr in get_all_vault_merkle_roots()]
        claimed_rewards = self.user_rewards.get_user_claimed_rewards(context, address)

        return get_withdrawals(
            context,
            address,
            claimed_rewards,
            rewards,
            merkle_trees,
            merkle_roots_epochs,
        )

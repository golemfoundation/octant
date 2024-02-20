from flask import current_app as app

from app.context.manager import Context
from app.infrastructure.external_api.etherscan.account import (
    get_transactions,
    AccountAction,
)
from app.infrastructure.external_api.bitquery.blocks_reward import get_blocks_reward
from app.modules.common.timestamp_converter import timestamp_to_isoformat
from app.modules.staking.proceeds.core import (
    sum_mev,
    sum_withdrawals,
    aggregate_proceeds,
)
from app.pydantic import Model


class AggregatedStakingProceeds(Model):
    def get_staking_proceeds(self, context: Context) -> int:
        """
        Retrieves a list of transactions, calculates MEV value and aggregates it with withdrawals.

        Transactions are got within the range from start_block to end_block - 1.
        End_block is taken exclusively as not to duplicate the same transactions from N and N+1
        epochs for which end_timestamp and start_timestamp are equal.

        Returns:
        - int: Aggregated value for MEV and withdrawals.
        """
        withdrawals_target = app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"].lower()
        start_block, end_block = (
            context.epoch_details.start_block,
            context.epoch_details.end_block,
        )

        if end_block is not None:
            end_block -= 1

        normal = get_transactions(
            withdrawals_target, start_block, end_block, tx_type=AccountAction.NORMAL
        )
        internal = get_transactions(
            withdrawals_target, start_block, end_block, tx_type=AccountAction.INTERNAL
        )
        withdrawals = get_transactions(
            withdrawals_target,
            start_block,
            end_block,
            tx_type=AccountAction.BEACON_WITHDRAWAL,
        )
        mev_value = sum_mev(withdrawals_target, normal, internal)
        withdrawals_value = sum_withdrawals(withdrawals)

        start_sec, end_sec = context.epoch_details.duration_range
        blocks_reward = 0
        if end_sec is not None:
            start_datetime, end_datetime = (
                timestamp_to_isoformat(start_sec),
                timestamp_to_isoformat(end_sec),
            )

            blocks_reward = get_blocks_reward(
                withdrawals_target, start_datetime, end_datetime
            )

        return aggregate_proceeds(mev_value, withdrawals_value, blocks_reward)

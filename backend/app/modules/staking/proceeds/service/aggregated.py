from flask import current_app as app

from app.context.manager import Context
from app.infrastructure.external_api.etherscan.account import get_transactions, TxType
from app.modules.staking.proceeds.core import (
    sum_mev,
    sum_withdrawals,
    aggregate_proceeds,
)
from app.pydantic import Model


class AggregatedStakingProceeds(Model):
    def get_staking_proceeds(self, context: Context) -> int:
        withdrawals_target = app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"].lower()
        start_block, end_block = (
            context.epoch_details.start_block,
            context.epoch_details.end_block,
        )

        normal = get_transactions(
            withdrawals_target, start_block, end_block, tx_type=TxType.NORMAL
        )
        internal = get_transactions(
            withdrawals_target, start_block, end_block, tx_type=TxType.INTERNAL
        )
        withdrawals = get_transactions(
            withdrawals_target, start_block, end_block, tx_type=TxType.BEACON_WITHDRAWAL
        )

        mev_value = sum_mev(withdrawals_target, normal, internal)
        withdrawals_value = sum_withdrawals(withdrawals)

        return aggregate_proceeds(mev_value, withdrawals_value)

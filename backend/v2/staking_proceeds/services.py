from web3 import AsyncWeb3
from app.infrastructure.external_api.etherscan.req_params import AccountAction
from app.modules.staking.proceeds.core import (
    aggregate_proceeds,
    sum_mev,
    sum_withdrawals,
)
from v2.staking_proceeds.bitquery import BitqueryClient
from v2.staking_proceeds.etherscan import EtherscanClient
from v2.withdrawals.dependencies import VaultSettings


class ContractBalanceStakingProceeds:
    def __init__(self, w3: AsyncWeb3, vault_settings: VaultSettings):
        self.w3 = w3
        self.vault_settings = vault_settings

    async def get(self) -> int:
        """
        This is the balance of the withdrawal contract.
        We need to subtract the surplus from the balance to get the staking proceeds.
        """
        balance = await self.w3.eth.get_balance(
            self.vault_settings.withdrawals_target_contract_address
        )
        return balance - self.vault_settings.epoch_2_staking_proceeds_surplus


# async def get_contract_balance_staking_proceeds(
#     w3: AsyncWeb3,
#     withdrawals_address: Address,
#     epoch2_surplus: int,
# ) -> int:
#     return int(w3.eth.get_balance(withdrawals_address)) - epoch2_surplus


class AggregatedStakingProceeds:
    def __init__(
        self,
        etherscan: EtherscanClient,
        bitquery: BitqueryClient,
        vault_settings: VaultSettings,
    ):
        self.etherscan = etherscan
        self.bitquery = bitquery
        self.vault_settings = vault_settings
        self.withdrawals_address = vault_settings.withdrawals_target_contract_address

    async def get(
        self,
        epoch_start_ts: int,
        epoch_end_ts: int,
    ) -> int:
        """
        Returns the aggregated staking proceeds for a given epoch.

        Retrieves a list of transactions, calculates MEV value and aggregates it with withdrawals.

        Transactions are got within the range from start_block to end_block - 1.
        End_block is taken exclusively as not to duplicate the same transactions from N and N+1
        epochs for which end_timestamp and start_timestamp are equal.

        Returns:
            - int: Aggregated value for MEV and withdrawals.
        """
        start_block = await self.etherscan.get_block_number(epoch_start_ts)
        end_block = await self.etherscan.get_block_number(epoch_end_ts)

        # withdrawals_target = app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"].lower()
        # start_block, end_block = (
        #     context.epoch_details.start_block,
        #     context.epoch_details.end_block,
        # )
        end_block_for_transactions = end_block - 1

        # Get transactions from Etherscan
        normal = await self.etherscan.get_transactions(
            self.withdrawals_address,
            start_block,
            end_block_for_transactions,
            tx_type=AccountAction.NORMAL,
        )
        internal = await self.etherscan.get_transactions(
            self.withdrawals_address,
            start_block,
            end_block_for_transactions,
            tx_type=AccountAction.INTERNAL,
        )
        withdrawals = await self.etherscan.get_transactions(
            self.withdrawals_address,
            start_block,
            end_block_for_transactions,
            tx_type=AccountAction.BEACON_WITHDRAWAL,
        )

        # Get blocks rewards from Bitquery
        block_rewards_value = await self.bitquery.get_blocks_rewards(
            self.withdrawals_address, start_block, end_block_for_transactions
        )

        # Calculate mev, withdrawals and aggregate proceeds
        mev_value = sum_mev(self.withdrawals_address, normal, internal)
        withdrawals_value = sum_withdrawals(withdrawals)
        return aggregate_proceeds(mev_value, withdrawals_value, block_rewards_value)


# async def get_aggregated_staking_proceeds(
#     etherscan: EtherscanClient,
#     bitquery: BitqueryClient,
#     withdrawals_address: Address,
#     start_block: int,
#     end_block: int,
# ) -> int:
#     """
#     Retrieves a list of transactions, calculates MEV value and aggregates it with withdrawals.

#     Transactions are got within the range from start_block to end_block - 1.
#     End_block is taken exclusively as not to duplicate the same transactions from N and N+1
#     epochs for which end_timestamp and start_timestamp are equal.

#     Returns:
#     - int: Aggregated value for MEV and withdrawals.
#     """

#     # withdrawals_target = app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"].lower()
#     # start_block, end_block = (
#     #     context.epoch_details.start_block,
#     #     context.epoch_details.end_block,
#     # )
#     end_block_for_transactions = end_block - 1

#     # Get transactions from Etherscan
#     normal = await etherscan.get_transactions(
#         withdrawals_address,
#         start_block,
#         end_block_for_transactions,
#         tx_type=AccountAction.NORMAL,
#     )
#     internal = await etherscan.get_transactions(
#         withdrawals_address,
#         start_block,
#         end_block_for_transactions,
#         tx_type=AccountAction.INTERNAL,
#     )
#     withdrawals = await etherscan.get_transactions(
#         withdrawals_address,
#         start_block,
#         end_block_for_transactions,
#         tx_type=AccountAction.BEACON_WITHDRAWAL,
#     )

#     # Get blocks rewards from Bitquery
#     block_rewards_value = await bitquery.get_blocks_rewards(
#         withdrawals_address,
#         start_block,
#         end_block_for_transactions
#     )

#     # Calculate mev, withdrawals and aggregate proceeds
#     mev_value = sum_mev(withdrawals_address, normal, internal)
#     withdrawals_value = sum_withdrawals(withdrawals)
#     return aggregate_proceeds(mev_value, withdrawals_value, block_rewards_value)

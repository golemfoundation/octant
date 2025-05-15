from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from v2.staking_proceeds.bitquery import BitqueryClient
from v2.staking_proceeds.etherscan import EtherscanClient
from v2.staking_proceeds.services import (
    AggregatedStakingProceeds,
    ContractBalanceStakingProceeds,
)
from v2.withdrawals.dependencies import GetVaultSettings
from v2.core.dependencies import OctantSettings, Web3


class EtherscanClientSettings(OctantSettings):
    etherscan_api_key: str
    etherscan_url: str = "https://api.etherscan.io/api"


class BitqueryClientSettings(OctantSettings):
    bitquery_api_key: str
    bitquery_bearer: str
    bitquery_url: str = "https://streaming.bitquery.io/graphql"


def get_etherscan_settings() -> EtherscanClientSettings:
    return EtherscanClientSettings()  # type: ignore[call-arg]


def get_bitquery_settings() -> BitqueryClientSettings:
    return BitqueryClientSettings()  # type: ignore[call-arg]


def get_etherscan_client(
    settings: Annotated[EtherscanClientSettings, Depends(get_etherscan_settings)]
) -> EtherscanClient:
    return EtherscanClient(
        url=settings.etherscan_url,
        api_key=settings.etherscan_api_key,
    )


def get_bitquery_client(
    settings: Annotated[BitqueryClientSettings, Depends(get_bitquery_settings)]
) -> BitqueryClient:
    return BitqueryClient(
        url=settings.bitquery_url,
        api_key=settings.bitquery_api_key,
        bearer=settings.bitquery_bearer,
    )


def get_aggregated_staking_proceeds(
    etherscan: GetEtherscanClient,
    bitquery: GetBitqueryClient,
    vault_settings: GetVaultSettings,
) -> AggregatedStakingProceeds:
    """
    Returns an instance of the AggregatedStakingProceeds class.
    """

    return AggregatedStakingProceeds(etherscan, bitquery, vault_settings)


def get_contract_balance_staking_proceeds(
    w3: Web3,
    vault_settings: GetVaultSettings,
) -> ContractBalanceStakingProceeds:
    """
    Returns an instance of the ContractBalanceStakingProceeds class.
    """
    return ContractBalanceStakingProceeds(w3, vault_settings)


GetAggregatedStakingProceeds = Annotated[
    AggregatedStakingProceeds,
    Depends(get_aggregated_staking_proceeds),
]

GetContractBalanceStakingProceeds = Annotated[
    ContractBalanceStakingProceeds,
    Depends(get_contract_balance_staking_proceeds),
]

GetEtherscanClient = Annotated[
    EtherscanClient,
    Depends(get_etherscan_client),
]

GetBitqueryClient = Annotated[
    BitqueryClient,
    Depends(get_bitquery_client),
]

from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from app.constants import SAFE_API_MAINNET, SAFE_API_SEPOLIA
from v2.multisig.safe import SafeClient
from v2.core.dependencies import GetChainSettings, Web3


from v2.multisig.contracts import SafeContractsFactory


def get_safe_client(chain_settings: GetChainSettings) -> SafeClient:
    return SafeClient(
        SAFE_API_MAINNET if chain_settings.is_mainnet else SAFE_API_SEPOLIA
    )


GetSafeClient = Annotated[SafeClient, Depends(get_safe_client)]


def get_safe_contracts_factory(
    w3: Web3, chain_settings: GetChainSettings
) -> SafeContractsFactory:
    return SafeContractsFactory(w3, chain_settings.chain_id)


GetSafeContractsFactory = Annotated[
    SafeContractsFactory, Depends(get_safe_contracts_factory)
]

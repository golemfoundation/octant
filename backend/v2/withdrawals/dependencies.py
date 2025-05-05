from typing import Annotated

from fastapi import Depends
from v2.core.types import Address
from v2.withdrawals.contracts import VAULT_ABI, VaultContract
from v2.core.dependencies import OctantSettings, Web3


class VaultSettings(OctantSettings):
    vault_contract_address: Address
    withdrawals_target_contract_address: Address


def get_vault_settings() -> VaultSettings:
    return VaultSettings()


async def get_vault_contracts(
    w3: Web3, settings: Annotated[VaultSettings, Depends(get_vault_settings)]
) -> VaultContract:
    return VaultContract(
        w3=w3,
        abi=VAULT_ABI,
        address=settings.vault_contract_address,
    )


GetVaultSettings = Annotated[VaultSettings, Depends(get_vault_settings)]
GetVaultContract = Annotated[VaultContract, Depends(get_vault_contracts)]

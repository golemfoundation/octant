from typing import Annotated

from fastapi import Depends
from v2.core.types import Address, BigInteger
from v2.withdrawals.contracts import VAULT_ABI, VaultContracts
from v2.core.dependencies import OctantSettings, Web3


class VaultSettings(OctantSettings):
    vault_contract_address: Address
    withdrawals_target_contract_address: Address
    epoch_2_staking_proceeds_surplus: BigInteger = 0
    vault_confirm_withdrawals_enabled: bool = False


def get_vault_settings() -> VaultSettings:
    return VaultSettings()


def get_vault_contracts(
    w3: Web3, settings: Annotated[VaultSettings, Depends(get_vault_settings)]
) -> VaultContracts:
    return VaultContracts(
        w3=w3,
        abi=VAULT_ABI,
        address=settings.vault_contract_address,
    )


GetVaultSettings = Annotated[VaultSettings, Depends(get_vault_settings)]
GetVaultContract = Annotated[VaultContracts, Depends(get_vault_contracts)]

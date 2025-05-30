from __future__ import annotations
from typing import Annotated

from fastapi import Depends
from v2.deposits.dependencies import GetDepositsContracts
from v2.core.dependencies import OctantSettings, Web3
from v2.glms.contracts import ERC20_ABI, GLMContracts


class GLMSettings(OctantSettings):
    glm_contract_address: str


def get_glm_settings() -> GLMSettings:
    return GLMSettings()  # type: ignore[call-arg]


def get_glm_contracts(
    w3: Web3, settings: Annotated[GLMSettings, Depends(get_glm_settings)]
) -> GLMContracts:
    return GLMContracts(w3, ERC20_ABI, settings.glm_contract_address)  # type: ignore[arg-type]


async def get_glm_balance_of_deposits(
    glm_contracts: GetGLMContracts,
    deposits_contracts: GetDepositsContracts,
) -> int:
    return await glm_contracts.balance_of(deposits_contracts.address)


GetGLMSettings = Annotated[GLMSettings, Depends(get_glm_settings)]
GetGLMContracts = Annotated[GLMContracts, Depends(get_glm_contracts)]
GetGLMBalanceOfDeposits = Annotated[int, Depends(get_glm_balance_of_deposits)]

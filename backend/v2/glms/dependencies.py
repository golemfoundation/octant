


from typing import Annotated
from fastapi import Depends
from pydantic_settings import BaseSettings

from v2.core.dependencies import OctantSettings, Web3


from .contracts import GLMContracts, ERC20_ABI


class GLMSettings(OctantSettings):
    glm_contract_address: str


def get_glm_settings() -> GLMSettings:
    return GLMSettings()


def get_glm_contracts(
    w3: Web3, settings: Annotated[GLMSettings, Depends(get_glm_settings)]
) -> GLMContracts:
    return GLMContracts(w3, ERC20_ABI, settings.glm_contract_address)

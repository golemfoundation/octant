from typing import Annotated
from fastapi import Depends

from v2.core.dependencies import OctantSettings, Web3


from .contracts import DepositsContracts, DEPOSITS_ABI


class DepositsSettings(OctantSettings):
    deposits_contract_address: str


def get_deposits_settings() -> DepositsSettings:
    return DepositsSettings()  # type: ignore[call-arg]


def get_deposits_contracts(
    w3: Web3, settings: Annotated[DepositsSettings, Depends(get_deposits_settings)]
) -> DepositsContracts:
    return DepositsContracts(w3, DEPOSITS_ABI, settings.deposits_contract_address)  # type: ignore[arg-type]

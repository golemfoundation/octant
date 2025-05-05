from typing import Annotated

from fastapi import Depends
from app.constants import (
    SABLIER_UNLOCK_GRACE_PERIOD_24_HRS,
    TEST_SABLIER_UNLOCK_GRACE_PERIOD_15_MIN,
)
from v2.deposits.services import DepositEventsStore
from v2.epochs.dependencies import GetEpochsSubgraph
from v2.sablier.dependencies import GetSablierSubgraph
from v2.core.dependencies import GetChainSettings, GetSession, OctantSettings, Web3
from v2.deposits.contracts import DEPOSITS_ABI, DepositsContracts


class DepositsSettings(OctantSettings):
    deposits_contract_address: str


def get_deposits_settings() -> DepositsSettings:
    return DepositsSettings()  # type: ignore[call-arg]


def get_deposits_contracts(
    w3: Web3, settings: Annotated[DepositsSettings, Depends(get_deposits_settings)]
) -> DepositsContracts:
    return DepositsContracts(w3, DEPOSITS_ABI, settings.deposits_contract_address)  # type: ignore[arg-type]


def get_deposit_events_repository(
    session: GetSession,
    epochs_subgraph: GetEpochsSubgraph,
    sublier_subgraph: GetSablierSubgraph,
    chain_settings: GetChainSettings,
) -> DepositEventsStore:
    sablier_unlock_grace_period = (
        SABLIER_UNLOCK_GRACE_PERIOD_24_HRS
        if chain_settings.is_mainnet
        else TEST_SABLIER_UNLOCK_GRACE_PERIOD_15_MIN
    )

    return DepositEventsStore(
        session,
        epochs_subgraph,
        sublier_subgraph,
        sablier_unlock_grace_period,
    )


# Annotated dependencies
GetDepositsSettings = Annotated[DepositsSettings, Depends(get_deposits_settings)]
GetDepositsContracts = Annotated[DepositsContracts, Depends(get_deposits_contracts)]
GetDepositEventsRepository = Annotated[
    DepositEventsStore, Depends(get_deposit_events_repository)
]

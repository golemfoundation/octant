from typing import Annotated

from fastapi import Depends
from v2.core.dependencies import OctantSettings, Web3

from .contracts import EPOCHS_ABI, EpochsContracts
from .subgraphs import EpochsSubgraph



class EpochsSettings(OctantSettings):
    epochs_contract_address: str


def get_epochs_settings() -> EpochsSettings:
    return EpochsSettings()


def get_epochs_contracts(
    w3: Web3, settings: Annotated[EpochsSettings, Depends(get_epochs_settings)]
) -> EpochsContracts:
    return EpochsContracts(w3, EPOCHS_ABI, settings.epochs_contract_address)


GetEpochsContracts = Annotated[
    EpochsContracts,
    Depends(get_epochs_contracts),
]


class EpochsSubgraphSettings(OctantSettings):
    subgraph_endpoint: str


def get_epochs_subgraph_settings() -> EpochsSubgraphSettings:
    return EpochsSubgraphSettings()


def get_epochs_subgraph(
    settings: Annotated[EpochsSubgraphSettings, Depends(get_epochs_subgraph_settings)]
) -> EpochsSubgraph:
    return EpochsSubgraph(settings.subgraph_endpoint)


GetEpochsSubgraph = Annotated[
    EpochsSubgraph,
    Depends(get_epochs_subgraph),
]
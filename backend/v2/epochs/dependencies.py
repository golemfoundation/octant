from typing import Annotated

from fastapi import Depends
from pydantic_settings import BaseSettings
from v2.core.dependencies import Web3

from .contracts import EPOCHS_ABI, EpochsContracts
from .subgraphs import EpochsSubgraph


class EpochsSettings(BaseSettings):
    epochs_contract_address: str


def get_epochs_contracts(
    w3: Web3, settings: Annotated[EpochsSettings, Depends(EpochsSettings)]
) -> EpochsContracts:
    return EpochsContracts(w3, EPOCHS_ABI, settings.epochs_contract_address)


class EpochsSubgraphSettings(BaseSettings):
    subgraph_endpoint: str


def get_epochs_subgraph(
    settings: Annotated[EpochsSubgraphSettings, Depends(EpochsSubgraphSettings)]
) -> EpochsSubgraph:
    return EpochsSubgraph(settings.subgraph_endpoint)

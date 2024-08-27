from typing import Callable

from pydantic_settings import BaseSettings
from v2.core.dependencies import w3_getter
from web3 import AsyncWeb3

from .contracts import EPOCHS_ABI, EpochsContracts
from .subgraphs import EpochsSubgraph


class EpochsSettings(BaseSettings):
    epochs_contract_address: str


# TODO: cache
def get_epochs(w3: AsyncWeb3, epochs_contract_address: str) -> EpochsContracts:
    return EpochsContracts(w3, EPOCHS_ABI, epochs_contract_address)  # type: ignore


def epochs_getter() -> EpochsContracts:
    settings = EpochsSettings()  # type: ignore
    return get_epochs(w3_getter(), settings.epochs_contract_address)


getter = Callable[[], EpochsContracts]


class EpochsSubgraphSettings(BaseSettings):
    subgraph_endpoint: str

    # url = config["SUBGRAPH_ENDPOINT"]


def epochs_subgraph_getter() -> EpochsSubgraph:
    settings = EpochsSubgraphSettings()  # type: ignore
    return EpochsSubgraph(settings.subgraph_endpoint)

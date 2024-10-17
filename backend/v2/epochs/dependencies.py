from typing import Annotated

from fastapi import Depends
from v2.core.dependencies import OctantSettings, Web3
from v2.core.exceptions import AllocationWindowClosed

from .contracts import EPOCHS_ABI, EpochsContracts
from .subgraphs import EpochsSubgraph


class EpochsSettings(OctantSettings):
    epochs_contract_address: str


def get_epochs_settings() -> EpochsSettings:
    return EpochsSettings()  # type: ignore[call-arg]


def get_epochs_contracts(
    w3: Web3, settings: Annotated[EpochsSettings, Depends(get_epochs_settings)]
) -> EpochsContracts:
    return EpochsContracts(w3, EPOCHS_ABI, settings.epochs_contract_address)  # type: ignore[arg-type]


GetEpochsContracts = Annotated[
    EpochsContracts,
    Depends(get_epochs_contracts),
]


async def assert_allocation_window_open(
    epochs_contracts: GetEpochsContracts,
) -> int:
    """Asserts that the allocation window is open and returns the current epoch number."""

    epoch_number = await epochs_contracts.get_pending_epoch()
    if epoch_number is None:
        raise AllocationWindowClosed()

    return epoch_number


AssertAllocationWindowOpen = Annotated[
    int,
    Depends(assert_allocation_window_open),
]


class EpochsSubgraphSettings(OctantSettings):
    subgraph_endpoint: str


def get_epochs_subgraph_settings() -> EpochsSubgraphSettings:
    return EpochsSubgraphSettings()  # type: ignore[call-arg]


def get_epochs_subgraph(
    settings: Annotated[EpochsSubgraphSettings, Depends(get_epochs_subgraph_settings)]
) -> EpochsSubgraph:
    return EpochsSubgraph(settings.subgraph_endpoint)


GetEpochsSubgraph = Annotated[
    EpochsSubgraph,
    Depends(get_epochs_subgraph),
]

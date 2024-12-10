from __future__ import annotations

import logging
from typing import Annotated

from fastapi import Depends
from pydantic import field_validator

from app.exceptions import InvalidEpoch
from app.modules.staking.proceeds.core import ESTIMATED_STAKING_REWARDS_RATE
from v2.core.dependencies import OctantSettings, Web3
from v2.core.exceptions import AllocationWindowClosed
from v2.core.transformers import transform_to_checksum_address
from v2.core.types import Address
from v2.epochs.contracts import EPOCHS_ABI, EpochsContract
from v2.epochs.subgraphs import EpochsSubgraph


class EpochsSettings(OctantSettings):
    epochs_contract_address: Address

    @field_validator("epochs_contract_address")
    @classmethod
    def validate_and_checksum_address(cls, value: str) -> Address:
        return transform_to_checksum_address(value)


def get_epochs_settings() -> EpochsSettings:
    return EpochsSettings()  # type: ignore[call-arg]


def get_epochs_contracts(
    w3: Web3, settings: Annotated[EpochsSettings, Depends(get_epochs_settings)]
) -> EpochsContract:
    return EpochsContract(
        w3, EPOCHS_ABI, settings.epochs_contract_address
    )


async def get_open_allocation_window_epoch_number(
    epochs_contracts: GetEpochsContracts,
) -> int:
    """Returns the current epoch number only if the allocation window is open,
    otherwise raises AllocationWindowClosed.
    """

    epoch_number = await epochs_contracts.get_pending_epoch()
    if epoch_number is None:
        raise AllocationWindowClosed()

    return epoch_number


class EpochsSubgraphSettings(OctantSettings):
    subgraph_endpoint: str


def get_epochs_subgraph_settings() -> EpochsSubgraphSettings:
    return EpochsSubgraphSettings()  # type: ignore[call-arg]


def get_epochs_subgraph(
    settings: Annotated[EpochsSubgraphSettings, Depends(get_epochs_subgraph_settings)]
) -> EpochsSubgraph:
    return EpochsSubgraph(settings.subgraph_endpoint)


async def get_current_epoch(epochs_contracts: GetEpochsContracts) -> int:
    return await epochs_contracts.get_current_epoch()


async def get_indexed_epoch(epochs_subgraph: GetEpochsSubgraph) -> int:
    latest_epoch = await epochs_subgraph.get_latest_epoch()
    return latest_epoch.epoch_num


async def get_rewards_rate(epoch_number: int) -> float:
    logging.debug(f"Getting rewards rate for epoch {epoch_number}")

    if epoch_number <= 0:
        raise InvalidEpoch()

    return ESTIMATED_STAKING_REWARDS_RATE


GetEpochsSubgraph = Annotated[
    EpochsSubgraph,
    Depends(get_epochs_subgraph),
]

GetEpochsContracts = Annotated[
    EpochsContract,
    Depends(get_epochs_contracts),
]

GetOpenAllocationWindowEpochNumber = Annotated[
    int,
    Depends(get_open_allocation_window_epoch_number),
]

GetCurrentEpoch = Annotated[
    int,
    Depends(get_current_epoch),
]

GetIndexedEpoch = Annotated[
    int,
    Depends(get_indexed_epoch),
]

GetRewardsRate = Annotated[
    float,
    Depends(get_rewards_rate),
]

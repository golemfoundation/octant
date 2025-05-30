from typing import Literal

from pydantic import Field
from v2.core.types import Address, OctantModel


class SyncStatusResponseV1(OctantModel):
    blockchain_epoch: int | None = Field(
        ..., description="Current Epoch number per blockchain state"
    )
    indexed_epoch: int | None = Field(
        ..., description="Current Epoch number according to indexer"
    )
    blockchain_height: int | None = Field(
        ..., description="Current block/slot number per blockchain"
    )
    indexed_height: int | None = Field(
        ..., description="Current block/slot number according to indexer"
    )
    pending_snapshot: str | None = Field(
        ...,
        description="State of pending epoch snapshot (not_applicable, error, in_progress, done)",
    )
    finalized_snapshot: str | None = Field(
        ...,
        description="State of finalized epoch snapshot (not_applicable, error, too_early, in_progress, done)",
    )


class SmartContractResponseV1(OctantModel):
    name: str = Field(..., description="Name of the smart contract")
    address: Address = Field(..., description="Address of the smart contract")


class ChainInfoResponseV1(OctantModel):
    chain_name: str = Field(..., description="Name of the blockchain")
    chain_id: int = Field(..., description="ID of the blockchain")
    smart_contracts: list[SmartContractResponseV1] = Field(
        ..., description="List of smart contracts"
    )


class VersionResponseV1(OctantModel):
    id: str = Field(..., description="Deployment identifier")
    env: str = Field(..., description="Deployment environment")
    chain: str = Field(..., description="Blockchain name")


UpOrDown = Literal["UP", "DOWN"]


class HealthcheckResponseV1(OctantModel):
    blockchain: UpOrDown = Field(
        ..., description="'UP' if blockchain RPC is responsive, 'DOWN' otherwise"
    )
    db: UpOrDown = Field(..., description="'UP' if db is responsive, 'DOWN' otherwise")
    subgraph: UpOrDown = Field(
        ..., description="'UP' if subgraph is responsive, 'DOWN' otherwise"
    )

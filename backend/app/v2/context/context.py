from dataclasses import dataclass
from decimal import Decimal

from app.v2.context.epoch_details import EpochDetails
from app.v2.context.epoch_state import EpochState
from app.v2.engine.epochs_settings import EpochSettings


@dataclass(frozen=True)
class OctantRewards:
    eth_proceeds: int
    locked_ratio: Decimal
    total_effective_deposit: int
    total_rewards: int
    individual_rewards: int


@dataclass
class Context:
    epoch_state: EpochState
    epoch_details: EpochDetails
    epoch_settings: EpochSettings
    octant_rewards: OctantRewards = None

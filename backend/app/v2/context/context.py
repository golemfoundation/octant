from abc import ABC
from dataclasses import dataclass
from decimal import Decimal
from typing import Dict, Optional

from app.database.models import FinalizedEpochSnapshot, User
from app.v2.context.epoch import EpochDetails
from app.v2.engine.epochs_settings import EpochSettings


@dataclass(frozen=True)
class OctantRewards:
    eth_proceeds: int
    locked_ratio: Decimal
    total_effective_deposit: int
    total_rewards: int
    individual_rewards: int


@dataclass
class EpochContext(ABC):
    epoch_num: int
    epoch_settings: EpochSettings
    epoch_details: EpochDetails
    octant_rewards: OctantRewards = None


@dataclass
class CurrentEpochContext(EpochContext):
    pass


@dataclass
class PrePendingEpochContext(EpochContext):
    pass


@dataclass
class PendingEpochContext(EpochContext):
    pass


@dataclass
class PreFinalizedEpochContext(EpochContext):
    pass


@dataclass
class FinalizedEpochContext(EpochContext):
    # TODO remove finalized snapshot, include matched_rewards in OctantRewards and add with_personal_allocations and with_project_rewards functions to builder
    finalized_snapshot: FinalizedEpochSnapshot = None


@dataclass
class FutureEpochContext(EpochContext):
    pass


@dataclass
class Context:
    finalized_epoch: int
    pending_epoch: int
    current_epoch: int
    epoch_context: Optional[EpochContext] = None
    finalized_epoch_context: Optional[FinalizedEpochContext] = None
    pre_finalized_epoch_context: Optional[PreFinalizedEpochContext] = None
    pending_epoch_context: Optional[PendingEpochContext] = None
    pre_pending_epoch_context: Optional[PrePendingEpochContext] = None
    current_epoch_context: Optional[CurrentEpochContext] = None
    future_epoch_context: Optional[FutureEpochContext] = None
    users_context: Optional[Dict[str, User]] = None

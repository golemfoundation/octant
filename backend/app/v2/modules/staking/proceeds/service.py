from abc import ABC, abstractmethod
from dataclasses import dataclass

from flask import current_app as app

from app.extensions import w3
from app.v2.modules.staking.proceeds.core import estimate_staking_proceeds


@dataclass
class StakingProceedsPayload:
    epoch_duration_sec: int = None


@dataclass
class StakingProceedsCalculator(ABC):
    @abstractmethod
    def get_staking_proceeds(self, payload: StakingProceedsPayload) -> int:
        pass


@dataclass
class WithdrawalsTargetStakingProceeds(StakingProceedsCalculator):
    def get_staking_proceeds(self, payload: StakingProceedsPayload) -> int:
        return w3.eth.get_balance(app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"])


@dataclass
class EstimatedStakingProceeds(StakingProceedsCalculator):
    def get_staking_proceeds(self, payload: StakingProceedsPayload) -> int:
        return estimate_staking_proceeds(payload.epoch_duration_sec)

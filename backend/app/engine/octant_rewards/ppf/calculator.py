from app.engine.octant_rewards.ppf import PPFCalculator, PPFPayload
from decimal import Decimal
from dataclasses import dataclass


@dataclass
class PPFCalculatorPercent(PPFCalculator):
    PPF_PERCENT: Decimal

    def calculate_ppf(self, payload: PPFPayload) -> int:
        return int(self.PPF_PERCENT * payload.eth_proceeds)

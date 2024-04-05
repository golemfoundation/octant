from app.engine.octant_rewards.ppf import PPFCalculator, PPFPayload
from dataclasses import dataclass


@dataclass
class NotSupportedPPFCalculator(PPFCalculator):
    def calculate_ppf(self, payload: PPFPayload) -> None:
        return None

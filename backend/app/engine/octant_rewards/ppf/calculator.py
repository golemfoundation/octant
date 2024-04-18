from app.engine.octant_rewards.ppf import PPFCalculator, PPFPayload
from dataclasses import dataclass


@dataclass
class PPFCalculatorFromRewards(PPFCalculator):
    def calculate_ppf(self, payload: PPFPayload) -> int:
        return int(
            payload.individual_rewards_equilibrium - payload.all_individual_rewards
        )

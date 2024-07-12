from app.engine.octant_rewards.ppf import PPFCalculator, PPFPayload
from dataclasses import dataclass


@dataclass
class PPFCalculatorFromRewards(PPFCalculator):
    def calculate_ppf(self, payload: PPFPayload) -> int:
        if payload.locked_ratio < payload.ire_percent:
            return int(
                payload.individual_rewards_equilibrium
                - payload.vanilla_individual_rewards
            )
        return 0

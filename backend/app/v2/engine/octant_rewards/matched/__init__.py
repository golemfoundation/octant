from dataclasses import dataclass


@dataclass
class MatchedRewardsPayload:
    total_rewards: int = None
    all_individual_rewards: int = None
    patrons_rewards: int = None

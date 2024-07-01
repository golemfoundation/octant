from app.engine.octant_rewards.matched import MatchedRewards, MatchedRewardsPayload


class PreliminaryMatchedRewards(MatchedRewards):
    def calculate_matched_rewards(self, payload: MatchedRewardsPayload) -> int:
        return (
            payload.total_rewards
            - payload.vanilla_individual_rewards
            + payload.patrons_rewards
        )

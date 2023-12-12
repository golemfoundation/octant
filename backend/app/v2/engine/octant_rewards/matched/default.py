from app.v2.engine.octant_rewards.matched import MatchedRewardsPayload, MatchedRewards


class DefaultMatchedRewards(MatchedRewards):
    def calculate_matched_rewards(self, payload: MatchedRewardsPayload) -> int:
        return (
            payload.total_rewards
            - payload.all_individual_rewards
            + payload.patrons_rewards
        )

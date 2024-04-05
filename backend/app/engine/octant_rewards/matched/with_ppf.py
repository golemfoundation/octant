from app.engine.octant_rewards.matched import MatchedRewards, MatchedRewardsPayload


class MatchedRewardsWithPPF(MatchedRewards):
    def calculate_matched_rewards(self, payload: MatchedRewardsPayload) -> int:
        return payload.total_rewards - payload.ppf + payload.patrons_rewards

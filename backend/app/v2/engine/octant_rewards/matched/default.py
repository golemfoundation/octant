from app.v2.engine.octant_rewards.matched import MatchedRewardsPayload


class DefaultMatchedRewards:
    def calculate_matched_rewards(self, payload: MatchedRewardsPayload):
        return payload.total_rewards - payload.all_individual_rewards + payload.patrons_rewards

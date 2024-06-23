from app.engine.octant_rewards.leftover import LeftoverPayload, Leftover


class LeftoverWithPPFAndUnusedMR(Leftover):
    def calculate_leftover(self, payload: LeftoverPayload) -> int:
        extra_individual_rewards = int(payload.ppf / 2)
        unused_matched_rewards = (
            payload.total_matched_rewards - payload.used_matched_rewards
        )
        return (
            payload.staking_proceeds
            - payload.operational_cost
            - payload.community_fund
            - extra_individual_rewards
            - payload.total_withdrawals
            + unused_matched_rewards
        )

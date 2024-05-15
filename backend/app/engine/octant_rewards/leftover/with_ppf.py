from app.engine.octant_rewards.leftover import LeftoverPayload, Leftover


class LeftoverWithPPF(Leftover):
    def calculate_leftover(self, payload: LeftoverPayload):
        return (
            payload.staking_proceeds
            - payload.operational_cost
            - payload.community_fund
            - int(payload.ppf / 2)
            - payload.total_withdrawals
        )

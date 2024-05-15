from app.engine.octant_rewards.leftover import Leftover, LeftoverPayload


class DefaultLeftover(Leftover):
    def calculate_leftover(self, payload: LeftoverPayload):
        return (
            payload.staking_proceeds
            - payload.operational_cost
            - payload.total_withdrawals
        )

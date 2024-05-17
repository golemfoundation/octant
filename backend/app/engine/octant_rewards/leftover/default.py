from app.engine.octant_rewards.leftover import Leftover, LeftoverPayload


class PreliminaryLeftover(Leftover):
    def calculate_leftover(self, payload: LeftoverPayload) -> int:
        return (
            payload.staking_proceeds
            - payload.operational_cost
            - payload.total_withdrawals
        )

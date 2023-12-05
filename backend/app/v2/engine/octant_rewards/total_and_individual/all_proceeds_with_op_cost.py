from app.v2.engine.octant_rewards.total_and_individual import TotalAndAllIndividualPayload

FOUNDATION_OPERATIONAL_COST_PERCENT = 0.2


class AllProceedsWithOperationalCost:
    def calculate_total_rewards(self, payload: TotalAndAllIndividualPayload) -> int:
        operational_cost = payload.eth_proceeds * FOUNDATION_OPERATIONAL_COST_PERCENT
        return int(payload.eth_proceeds - operational_cost)

    def calculate_all_individual_rewards(self, payload: TotalAndAllIndividualPayload) -> int:
        total_rewards = self.calculate_total_rewards(payload)
        return int(payload.locked_ratio.sqrt() * total_rewards)

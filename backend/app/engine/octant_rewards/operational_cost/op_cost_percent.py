from dataclasses import dataclass
from decimal import Decimal

from app.engine.octant_rewards.operational_cost import (
    OperationalCostPayload,
    OperationalCost,
)


@dataclass
class OpCostPercent(OperationalCost):
    OPERATIONAL_COST: Decimal

    def calculate_operational_cost(self, payload: OperationalCostPayload) -> int:
        return int(payload.eth_proceeds * self.OPERATIONAL_COST)

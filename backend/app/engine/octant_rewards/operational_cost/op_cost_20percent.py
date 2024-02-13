from dataclasses import dataclass
from decimal import Decimal

from app.engine.octant_rewards.operational_cost import (
    OperationalCostPayload,
    OperationalCost,
)

FOUNDATION_OPERATIONAL_COST_PERCENT = Decimal("0.2")


@dataclass
class OpCost20Percent(OperationalCost):
    def calculate_operational_cost(self, payload: OperationalCostPayload) -> int:
        return int(payload.eth_proceeds * FOUNDATION_OPERATIONAL_COST_PERCENT)

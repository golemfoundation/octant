from decimal import Decimal

from app.constants import GLM_TOTAL_SUPPLY_WEI


class DefaultLockedRatioStrategy:
    def calculate_locked_ratio(self, total_effective_deposit: int) -> Decimal:
        return Decimal(total_effective_deposit) / Decimal(GLM_TOTAL_SUPPLY_WEI)

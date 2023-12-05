from decimal import Decimal

from app.constants import GLM_TOTAL_SUPPLY_WEI
from app.v2.engine.octant_rewards.locked_ratio import LockedRatioPayload, LockedRatio


class DefaultLockedRatio(LockedRatio):
    def calculate_locked_ratio(self, payload: LockedRatioPayload) -> Decimal:
        return Decimal(payload.total_effective_deposit) / Decimal(GLM_TOTAL_SUPPLY_WEI)

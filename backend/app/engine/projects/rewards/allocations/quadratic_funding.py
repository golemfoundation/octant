from decimal import Decimal
from math import sqrt
from typing import List

from app.engine.projects.rewards import AllocationItem
from app.engine.projects.rewards import ProjectAllocations


class QuadraticFundingAllocations(ProjectAllocations):
    def _calc_allocations(self, allocations: List[AllocationItem]) -> Decimal:
        sum_sqrts = sum(
            [Decimal(sqrt(allocation.amount)) for allocation in allocations]
        )
        quadratic_value = sum_sqrts**2
        return quadratic_value

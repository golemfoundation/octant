from decimal import Decimal
from math import sqrt
from typing import List

from app.engine.projects.rewards import AllocationItem
from app.engine.projects.rewards import ProjectAllocations
from app.infrastructure.database.uniqueness_quotient import get_uq_by_address


class QuadraticFundingAllocations(ProjectAllocations):
    def _calc_allocations(
        self, allocations: List[AllocationItem], epoch_num: int
    ) -> Decimal:
        sum_sqrts = Decimal("0.0")
        for allocation in allocations:
            user_uq_score = Decimal(
                get_uq_by_address(allocation.user_address, epoch_num).score
            )
            user_sqrt_allocation = Decimal(sqrt(user_uq_score * allocation.amount))
            sum_sqrts += user_sqrt_allocation

        quadratic_value = sum_sqrts**2
        return quadratic_value

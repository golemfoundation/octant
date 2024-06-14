from decimal import Decimal
from math import sqrt
from typing import List

from app.engine.projects.rewards import AllocationItem
from app.engine.projects.rewards import ProjectAllocations


class QuadraticFundingAllocations(ProjectAllocations):
    def _calc_allocations(self, allocations: List[AllocationItem]) -> Decimal:
        """
        Calculate quadratic funding for a project.
        Returns the sum of the square roots of the uq_scores multiplied by the amounts.
        The unit is in Decimal to avoid floating point errors but in the end the result is cast to int.
        """
        sum_sqrts = sum(
            Decimal(sqrt(allocation.uq_score * allocation.amount))
            for allocation in allocations
        )
        quadratic_value = sum_sqrts**2
        return quadratic_value

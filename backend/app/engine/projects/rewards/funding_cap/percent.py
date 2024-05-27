from dataclasses import dataclass
from decimal import Decimal
from typing import Dict, List
import pandas as pd

from app.engine.projects.rewards.allocations import ProjectSumAllocationsDTO


@dataclass
class FundingCapPercentCalculator:
    FUNDING_CAP_PERCENT: Decimal

    def apply_capped_distribution(
        self,
        matched_allocated_by_addr: List[ProjectSumAllocationsDTO],
        matched_rewards: int,
    ) -> Dict[str, Decimal]:
        matched_allocated_by_addr = pd.DataFrame(matched_allocated_by_addr)
        grouped_allocated_by_addr = matched_allocated_by_addr.groupby(
            "project_address"
        )["amount"].sum()
        capped_quadratic_distribution = grouped_allocated_by_addr.copy()

        surplus = Decimal(0)
        cap_amount = Decimal(matched_rewards * self.FUNDING_CAP_PERCENT)

        for project in capped_quadratic_distribution.index:
            if capped_quadratic_distribution[project] > cap_amount:
                surplus += Decimal(capped_quadratic_distribution[project] - cap_amount)
                capped_quadratic_distribution[project] = cap_amount

        while surplus > 0:
            uncapped_proposals = capped_quadratic_distribution[
                capped_quadratic_distribution < cap_amount
            ]
            uncapped_distribution = (
                uncapped_proposals / Decimal(uncapped_proposals.sum()) * surplus
            ).apply(Decimal)

            new_surplus = 0
            for proposal in uncapped_distribution.index:
                if (
                    capped_quadratic_distribution[proposal]
                    + uncapped_distribution[proposal]
                    > cap_amount
                ):
                    new_surplus += (
                        capped_quadratic_distribution[proposal]
                        + uncapped_distribution[proposal]
                    ) - cap_amount
                    capped_quadratic_distribution[proposal] = cap_amount
                else:
                    capped_quadratic_distribution[proposal] += uncapped_distribution[
                        proposal
                    ]

            surplus = new_surplus

        return capped_quadratic_distribution.to_dict()

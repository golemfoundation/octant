from dataclasses import dataclass
from decimal import Decimal
from typing import Dict, List

import pandas as pd
from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class ProjectMatchedRewardsDTO(JSONWizard):
    project_address: str
    amount: Decimal


@dataclass
class FundingCapPercentCalculator:
    FUNDING_CAP_PERCENT: Decimal

    def _calculate_surplus_to_project(
        self,
        cap_amount: Decimal,
        capped_quadratic_distribution: pd.DataFrame,
        uncapped_distribution: pd.DataFrame,
    ) -> Decimal:
        new_surplus = Decimal(0)
        for project in uncapped_distribution.index:
            if (
                capped_quadratic_distribution[project] + uncapped_distribution[project]
                > cap_amount
            ):
                new_surplus += (
                    capped_quadratic_distribution[project]
                    + uncapped_distribution[project]
                ) - cap_amount
                capped_quadratic_distribution[project] = cap_amount
            else:
                capped_quadratic_distribution[project] += uncapped_distribution[project]
        return new_surplus

    def apply_capped_distribution(
        self,
        matched_allocated_by_addr: List[ProjectMatchedRewardsDTO],
        matched_rewards: int,
    ) -> Dict[str, Decimal]:
        if not matched_allocated_by_addr:
            return {}

        matched_allocated_by_addr = pd.DataFrame(matched_allocated_by_addr)
        grouped_allocated_by_addr = matched_allocated_by_addr.groupby(
            "project_address"
        )["amount"].sum()
        capped_quadratic_distribution = grouped_allocated_by_addr.copy()

        surplus = Decimal(0)
        cap_amount = matched_rewards * self.FUNDING_CAP_PERCENT

        for project in capped_quadratic_distribution.index:
            if capped_quadratic_distribution[project] > cap_amount:
                surplus += Decimal(capped_quadratic_distribution[project] - cap_amount)
                capped_quadratic_distribution[project] = cap_amount

        while surplus > 0:
            uncapped_projects = capped_quadratic_distribution[
                capped_quadratic_distribution < cap_amount
            ]

            left_uncapped_projects = uncapped_projects.sum()
            if left_uncapped_projects == 0:
                break

            uncapped_distribution = (
                uncapped_projects / Decimal(left_uncapped_projects) * surplus
            ).apply(Decimal)

            new_surplus = self._calculate_surplus_to_project(
                cap_amount, capped_quadratic_distribution, uncapped_distribution
            )
            surplus = new_surplus

        return capped_quadratic_distribution.to_dict()

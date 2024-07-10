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

    def apply_capped_distribution(
        self,
        matched_allocated_by_addr: List[ProjectMatchedRewardsDTO],
        matched_rewards: int,
    ) -> Dict[str, Decimal]:
        if not matched_allocated_by_addr:
            return {}

        cap_amount = matched_rewards * self.FUNDING_CAP_PERCENT
        matched_allocated_by_addr = pd.DataFrame(matched_allocated_by_addr)
        grouped_matched_by_addr = matched_allocated_by_addr.groupby("project_address")[
            "amount"
        ].sum()

        for project in grouped_matched_by_addr.index:
            if grouped_matched_by_addr[project] > cap_amount:
                grouped_matched_by_addr[project] = cap_amount

        return grouped_matched_by_addr.to_dict()

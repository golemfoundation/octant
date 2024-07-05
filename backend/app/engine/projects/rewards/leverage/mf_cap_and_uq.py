from dataclasses import dataclass
from decimal import Decimal
from typing import Dict, List

from app.engine.projects.rewards import Leverage


@dataclass
class MRCapAndUQLeverage(Leverage):
    def calculate_individual_leverage(
        self,
        before_capped_matched_rewards: Dict[str, Decimal],
        actual_capped_matched: Dict[str, Decimal],
        project_addresses: List[str],
        user_new_allocations: int,
    ) -> float:
        total_difference = 0
        for project_address in project_addresses:
            before_capped_matched = before_capped_matched_rewards.get(
                project_address, 0
            )
            capped_matched_amount = actual_capped_matched[project_address]

            difference = abs(before_capped_matched - capped_matched_amount)
            total_difference += difference

        leverage = (
            total_difference / user_new_allocations if user_new_allocations > 0 else 0
        )

        return float(leverage)

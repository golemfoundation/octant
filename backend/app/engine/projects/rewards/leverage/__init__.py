from dataclasses import dataclass
from decimal import Decimal
from typing import Dict, List

from app.exceptions import IndividualLeverageNotImplementedError


@dataclass
class Leverage:
    def calculate_leverage(self, matched_rewards: int, total_allocated: int) -> float:
        return matched_rewards / total_allocated if total_allocated else 0

    def calculate_individual_leverage(
        self,
        before_capped_matched_rewards: Dict[str, Decimal],
        actual_capped_matched: Dict[str, Decimal],
        project_addresses: List[str],
        user_new_allocations: int,
    ) -> float:
        raise IndividualLeverageNotImplementedError()

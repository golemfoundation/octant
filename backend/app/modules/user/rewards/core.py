from typing import Dict, List


def get_unused_rewards(
    budgets: Dict[str, int], donors: List[str], patrons: List[str]
) -> Dict[str, int]:
    for donor in donors:
        budgets.pop(donor)
    for patron in patrons:
        budgets.pop(patron)

    return budgets

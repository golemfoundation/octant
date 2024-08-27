from collections import defaultdict
from decimal import Decimal
from math import sqrt
from typing import Dict, NamedTuple

from v2.allocations.models import AllocationWithUserUQScore


class CappedQuadriaticFunding(NamedTuple):
    amounts_by_project: Dict[
        str, Decimal
    ]  # Sum of all allocation amounts for each project
    matched_by_project: Dict[str, Decimal]  # Sum of matched rewards for each project
    amounts_total: Decimal  # Sum of all allocation amounts for all projects
    matched_total: Decimal  # Sum of all matched rewards for all projects


MR_FUNDING_CAP_PERCENT = Decimal("0.2")


def capped_quadriatic_funding(
    allocations: list[AllocationWithUserUQScore],
    matched_rewards: int,
    project_addresses: list[str],
    MR_FUNDING_CAP_PERCENT: Decimal = MR_FUNDING_CAP_PERCENT,
) -> CappedQuadriaticFunding:
    """
    Calculate capped quadratic funding based on a list of allocations.

    Args:
        allocations (list[AllocationItem]): A list of allocation items, each containing a project address and an amount.
        matched_rewards (int): The total amount of matched rewards available for distribution.
        project_addresses (list[str] | None, optional): A list of project addresses to consider. If None, all projects in allocations are considered. Defaults to None.
        MR_FUNDING_CAP_PERCENT (float, optional): The maximum percentage of matched rewards that any single project can receive. Defaults to MR_FUNDING_CAP_PERCENT.

    Returns:
        CappedQuadriaticFunding: A named tuple containing the total and per-project amounts and matched rewards.
    """

    # Group allocations by project
    per_project_allocations: Dict[str, list[AllocationWithUserUQScore]] = defaultdict(
        list
    )
    for allocation in allocations:
        per_project_allocations[allocation.project_address].append(allocation)

    # Variables necessary for calculation of quadratic funding
    total_qf = Decimal(0)
    qf_by_project: Dict[str, Decimal] = {}

    # Aggregate variables for amounts & matched rewards
    amount_by_project: Dict[str, Decimal] = {
        project_address: Decimal(0) for project_address in project_addresses
    }
    matched_by_project: Dict[str, Decimal] = {
        project_address: Decimal(0) for project_address in project_addresses
    }
    matched_total = Decimal(0)
    amounts_total = Decimal(0)

    # Calculate quadratic funding for each project
    for project_address, allocations in per_project_allocations.items():
        qf = (
            sum(
                (
                    Decimal(sqrt(allocation.user_uq_score * allocation.amount))
                    for allocation in allocations
                ),
                start=Decimal(0),
            )
            ** 2
        )

        total_qf += qf
        qf_by_project[project_address] = qf

        # Aggregate amount by project
        sum_amount = sum(
            (Decimal(allocation.amount) for allocation in allocations), start=Decimal(0)
        )
        amount_by_project[project_address] = sum_amount
        amounts_total += sum_amount

    # Calculate funding cap
    max_matched_reward = matched_rewards * MR_FUNDING_CAP_PERCENT

    # Calculate matched rewards for each project
    for project_address, qf in qf_by_project.items():
        # Calculate matched rewards as proportion of quadratic funding
        matched = qf / total_qf * matched_rewards if total_qf != 0 else Decimal(0)

        # Apply funding cap
        matched_capped = min(matched, max_matched_reward)

        # Update matched rewards and total rewards
        matched_by_project[project_address] = matched_capped
        matched_total += matched_capped

    return CappedQuadriaticFunding(
        amounts_by_project=amount_by_project,
        matched_by_project=matched_by_project,
        amounts_total=total_qf,
        matched_total=matched_total,
    )


def cqf_calculate_total_leverage(matched_rewards: int, total_allocated: int) -> float:
    if total_allocated == 0:
        return 0.0

    return matched_rewards / total_allocated


def cqf_calculate_individual_leverage(
    new_allocations_amount: int,
    project_addresses: list[str],
    before_allocation_matched: Dict[str, Decimal],
    after_allocation_matched: Dict[str, Decimal],
) -> float:
    """Calculate the leverage of a user's new allocations in capped quadratic funding.

    This is a ratio of the sum of the absolute differences between the capped matched rewards before and after the user's allocation, to the total amount of the user's new allocations.
    """

    if new_allocations_amount == 0:
        return 0.0

    total_difference = Decimal(0)
    for project_address in project_addresses:
        before = before_allocation_matched.get(project_address, 0)
        after = after_allocation_matched[project_address]

        difference = abs(before - after)
        total_difference += difference

    leverage = total_difference / new_allocations_amount

    return float(leverage)

from collections import defaultdict
from decimal import Decimal
from math import sqrt
from typing import Dict, NamedTuple

from v2.allocations.schemas import AllocationWithUserUQScore
from v2.core.types import Address
from v2.project_rewards.schemas import ProjectFundingSummary


class CappedQuadriaticFunding(NamedTuple):
    project_fundings: dict[Address, ProjectFundingSummary]
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

    project_fundings = {
        project_address: ProjectFundingSummary(
            address=project_address,
            allocated=int(amount_by_project[project_address]),
            matched=int(matched_by_project[project_address]),
        )
        for project_address in project_addresses
    }

    return CappedQuadriaticFunding(
        project_fundings=project_fundings,
        amounts_total=amounts_total,
        matched_total=matched_total,
    )


def cqf_calculate_total_leverage(matched_rewards: int, total_allocated: int) -> float:
    if total_allocated == 0:
        return 0.0

    return matched_rewards / total_allocated


def cqf_calculate_individual_leverage(
    new_allocations_amount: int,
    project_addresses: list[Address],
    before_allocation: CappedQuadriaticFunding,
    after_allocation: CappedQuadriaticFunding,
) -> float:
    """Calculate the leverage of a user's new allocations in capped quadratic funding.

    This is a ratio of the sum of the absolute differences between the capped matched rewards before and after the user's allocation, to the total amount of the user's new allocations.
    """

    if new_allocations_amount == 0:
        return 0.0

    total_difference = Decimal(0)
    for project_address in project_addresses:
        if project_address in before_allocation.project_fundings:
            before = Decimal(
                before_allocation.project_fundings[project_address].matched
            )
        else:
            before = Decimal(0)

        # before = before_allocation_matched.get(project_address, 0)
        after = after_allocation.project_fundings[project_address].matched
        # after = after_allocation_matched[project_address]

        difference = abs(before - after)
        total_difference += difference

    leverage = total_difference / new_allocations_amount

    return float(leverage)


def cqf_simulate_leverage(
    existing_allocations: list[AllocationWithUserUQScore],
    new_allocations: list[AllocationWithUserUQScore],
    matched_rewards: int,
    project_addresses: list[str],
    MR_FUNDING_CAP_PERCENT: Decimal = MR_FUNDING_CAP_PERCENT,
) -> float:
    """Simulate the leverage of a user's new allocations in capped quadratic funding."""

    if not new_allocations:
        raise ValueError("No new allocations provided")

    # Get the user address associated with the allocations
    user_address = new_allocations[0].user_address

    # Remove allocations made by this user (as they will be removed in a second)
    allocations_without_user = [
        a for a in existing_allocations if a.user_address != user_address
    ]

    # Calculate capped quadratic funding before and after the user's allocation
    before_allocation = capped_quadriatic_funding(
        allocations_without_user,
        matched_rewards,
        project_addresses,
        MR_FUNDING_CAP_PERCENT,
    )
    after_allocation = capped_quadriatic_funding(
        allocations_without_user + new_allocations,
        matched_rewards,
        project_addresses,
        MR_FUNDING_CAP_PERCENT,
    )

    # Calculate leverage
    leverage = cqf_calculate_individual_leverage(
        new_allocations_amount=sum(a.amount for a in new_allocations),
        project_addresses=[a.project_address for a in new_allocations],
        before_allocation=before_allocation,
        after_allocation=after_allocation,
    )

    return leverage

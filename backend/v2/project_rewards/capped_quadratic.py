"""
Capped Quadratic Funding (CQF) implementation.

This module implements the Capped Quadratic Funding algorithm for distributing
matched rewards to projects based on user allocations and uniqueness scores.

Key Concepts:
    - Quadratic Funding:
        - Rewards proportional to square of sum of square roots
        - Encourages broad participation
        - Formula: (Σ√(amount * uq_score))²
        - Considers user uniqueness scores - applied as multiplier to matched rewards

    - Funding Cap:
        - Limits maximum rewards per project
        - Default cap: 20% of total matched rewards
        - Prevents single project dominance
        - Ensures fair distribution

    - Leverage:
        - Measure of allocation impact
        - Calculated as ratio of reward change to allocation amount
        - Higher leverage means more efficient allocation
        - Used for user feedback

    - Project Funding:
        - Tracks allocated and matched amounts
        - Maintains project-specific totals
        - Handles multiple allocations
        - Supports simulation
"""

from collections import defaultdict
from decimal import Decimal
from math import sqrt
from typing import Dict, NamedTuple

from v2.allocations.schemas import AllocationWithUserUQScore
from v2.core.types import Address
from v2.project_rewards.schemas import ProjectFundingSummaryV1


class CappedQuadraticFunding(NamedTuple):
    """
    Results of capped quadratic funding calculation.

    Attributes:
        project_fundings: Dictionary mapping project addresses to their funding details:
            - allocated: Total amount allocated to project
            - matched: Total matched rewards received
        allocations_total_for_all_projects: Sum of all allocations
        matched_total_for_all_projects: Sum of all matched rewards

    Note:
        - All amounts are in base units (wei)
        - Matched rewards are capped per project
        - Totals include all projects
    """

    project_fundings: dict[Address, ProjectFundingSummaryV1]
    allocations_total_for_all_projects: Decimal
    matched_total_for_all_projects: Decimal


# Maximum percentage of matched rewards any single project can receive
MR_FUNDING_CAP_PERCENT = Decimal("0.2")


def capped_quadratic_funding(
    allocations: list[AllocationWithUserUQScore],
    matched_rewards: int,
    project_addresses: list[str],
    MR_FUNDING_CAP_PERCENT: Decimal = MR_FUNDING_CAP_PERCENT,
) -> CappedQuadraticFunding:
    """
    Calculate capped quadratic funding based on a list of allocations.

    The algorithm:
    1. Groups allocations by project
    2. Calculates quadratic funding for each project:
        - Sums √(amount * uq_score) for each allocation
        - Squares the sum
    3. Applies funding cap:
        - Limits project rewards to cap percentage
        - Distributes remaining rewards proportionally
    4. Returns funding summary for all projects

    Args:
        allocations: List of allocations with user UQ scores
        matched_rewards: Total matched rewards available
        project_addresses: List of all project addresses
        MR_FUNDING_CAP_PERCENT: Maximum percentage per project (default: 20%)

    Returns:
        CappedQuadraticFunding: Funding results including:
            - Per-project allocations and matches
            - Total allocations and matches

    Note:
        - Uses square root of (amount * uq_score)
        - Applies funding cap after QF calculation
        - Handles zero allocations gracefully
        - Returns results in base units
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
        project_address: ProjectFundingSummaryV1(
            address=project_address,
            allocated=int(amount_by_project[project_address]),
            matched=int(matched_by_project[project_address]),
        )
        for project_address in project_addresses
    }

    return CappedQuadraticFunding(
        project_fundings=project_fundings,
        allocations_total_for_all_projects=amounts_total,
        matched_total_for_all_projects=matched_total,
    )


def cqf_calculate_total_leverage(matched_rewards: int, total_allocated: int) -> float:
    """
    Calculate the total leverage of all allocations.

    This is the ratio of total matched rewards to total allocated amount.
    Higher leverage means more efficient use of allocated funds.

    Args:
        matched_rewards: Total matched rewards
        total_allocated: Total amount allocated

    Returns:
        float: Leverage ratio (matched_rewards / total_allocated)

    Note:
        - Returns 0.0 if no allocations
        - Higher ratio means better efficiency
    """

    if total_allocated == 0:
        return 0.0

    return matched_rewards / total_allocated


def cqf_calculate_individual_leverage(
    new_allocations_amount: int,
    project_addresses: list[Address],
    before_allocation: CappedQuadraticFunding,
    after_allocation: CappedQuadraticFunding,
) -> float:
    """
    Calculate the leverage of a user's new allocations.

    This is the ratio of the sum of absolute differences in matched rewards
    (before and after allocation) to the total amount of new allocations.
    Higher leverage means the allocation had more impact on reward distribution.

    Args:
        new_allocations_amount: Total amount of new allocations
        project_addresses: List of projects receiving allocations
        before_allocation: Funding state before new allocations
        after_allocation: Funding state after new allocations

    Returns:
        float: Leverage ratio (total_difference / new_allocations_amount)

    Note:
        - Returns 0.0 if no new allocations
        - Higher ratio means more impact
        - Considers all affected projects
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

        after = after_allocation.project_fundings[project_address].matched
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
    """
    Simulate the leverage of new allocations.

    This function:
    1. Removes existing allocations from the user
    2. Calculates funding state before new allocations
    3. Calculates funding state after new allocations
    4. Computes the leverage of the change

    Args:
        existing_allocations: Current allocations from all users
        new_allocations: Proposed new allocations
        matched_rewards: Total matched rewards available
        project_addresses: List of all project addresses
        MR_FUNDING_CAP_PERCENT: Maximum percentage per project

    Returns:
        float: Simulated leverage ratio

    Raises:
        ValueError: If no new allocations provided

    Note:
        - Simulates complete replacement of user's allocations
        - Considers all affected projects
        - Uses same cap percentage as main calculation
    """

    if not new_allocations:
        raise ValueError("No new allocations provided")

    # Get the user address associated with the allocations
    user_address = new_allocations[0].user_address

    # Remove allocations made by this user (as they will be removed in a second)
    allocations_without_user = [
        a for a in existing_allocations if a.user_address != user_address
    ]

    # Calculate capped quadratic funding before and after the user's allocation
    before_allocation = capped_quadratic_funding(
        allocations_without_user,
        matched_rewards,
        project_addresses,
        MR_FUNDING_CAP_PERCENT,
    )
    after_allocation = capped_quadratic_funding(
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

"""
Allocation management and calculation services.

This module provides services for managing user allocations to projects, including:
- Allocation processing and storage
- Leverage calculation
- Allocation simulation
- Matched rewards distribution

Key Concepts:
    - Allocations:
        - User's distribution of funds to projects
        - Requires signature verification
        - Affected by user's UQ score
        - Stored with nonce for replay protection

    - Leverage:
        - Measure of allocation impact
        - Calculated using capped quadratic funding
        - Considers user's UQ score
        - Affects matched rewards distribution

    - Capped Quadratic Funding:
        - Algorithm for distributing matched rewards
        - Uses square root of allocations
        - Includes funding cap percentage
        - Considers all project allocations

    - Simulation:
        - Previews allocation impact
        - Calculates potential leverage
        - Shows matched rewards distribution
        - Helps users make informed decisions
"""

from dataclasses import dataclass

from app import exceptions
from sqlalchemy.ext.asyncio import AsyncSession
from v2.core.types import Address
from v2.allocations.repositories import (
    get_allocations_with_user_uqs,
    soft_delete_user_allocations_by_epoch,
    store_allocation_request,
)
from v2.allocations.schemas import (
    AllocationRequestV1,
    AllocationWithUserUQScore,
    ProjectMatchedRewardsV1,
    SimulateAllocationResponseV1,
    UserAllocationRequest,
)
from v2.allocations.validators import SignatureVerifier
from v2.matched_rewards.services import MatchedRewardsEstimator
from v2.project_rewards.capped_quadratic import (
    MR_FUNDING_CAP_PERCENT,
    capped_quadratic_funding,
    cqf_calculate_individual_leverage,
    cqf_simulate_leverage,
)
from v2.projects.contracts import ProjectsContracts
from v2.uniqueness_quotients.dependencies import UQScoreGetter
from v2.users.repositories import get_user_by_address


@dataclass
class Allocator:
    """
    Service for processing user allocations.

    This class handles the allocation process, including:
    - Signature verification
    - UQ score calculation
    - Leverage computation
    - Allocation storage

    Attributes:
        session: Database session for persistence
        signature_verifier: Verifies allocation signatures
        uq_score_getter: Retrieves user uniqueness scores
        projects_contracts: Manages project data
        matched_rewards_estimator: Calculates matched rewards
        epoch_number: Current epoch number

    Note:
        - Requires valid signature
        - Updates user's allocation nonce
        - Soft deletes previous allocations
        - Stores new allocations with leverage
    """

    session: AsyncSession
    signature_verifier: SignatureVerifier
    uq_score_getter: UQScoreGetter
    projects_contracts: ProjectsContracts
    matched_rewards_estimator: MatchedRewardsEstimator
    epoch_number: int

    async def handle(
        self,
        # epoch_number: int,
        request: UserAllocationRequest,
    ) -> str:
        """
        Process a user's allocation request.

        This method:
        1. Verifies the allocation signature
        2. Gets/calculates user's UQ score
        3. Calculates allocation leverage
        4. Stores the allocation

        Args:
            request: The allocation request containing:
                - user_address: Allocator's address
                - nonce: Request sequence number
                - allocations: List of project allocations

        Returns:
            str: The user's address

        Note:
            - Updates user's allocation nonce
            - Soft deletes previous allocations
            - Stores new allocations with leverage
        """
        return await allocate(
            session=self.session,
            signature_verifier=self.signature_verifier,
            uq_score_getter=self.uq_score_getter,
            projects_contracts=self.projects_contracts,
            matched_rewards_estimator=self.matched_rewards_estimator,
            epoch_number=self.epoch_number,
            request=request,
        )


async def allocate(
    # Component dependencies
    session: AsyncSession,
    signature_verifier: SignatureVerifier,
    uq_score_getter: UQScoreGetter,
    projects_contracts: ProjectsContracts,
    matched_rewards_estimator: MatchedRewardsEstimator,
    epoch_number: int,
    # Arguments
    request: UserAllocationRequest,
) -> str:
    """
    Process and store a user's allocation request.

    This function handles the complete allocation process:
    1. Verifies the allocation signature
    2. Gets/calculates user's UQ score
    3. Calculates allocation leverage
    4. Updates user's allocation nonce
    5. Stores the new allocation

    Args:
        session: Database session
        signature_verifier: Signature verification service
        uq_score_getter: UQ score service
        projects_contracts: Project data service
        matched_rewards_estimator: Matched rewards calculator
        epoch_number: Current epoch
        request: User's allocation request

    Returns:
        str: User's address

    Raises:
        UserNotFound: If user doesn't exist
        InvalidSignature: If signature verification fails

    Note:
        - Soft deletes previous allocations
        - Updates user's allocation nonce
        - Stores new allocations with leverage
        - Commits transaction on success
    """

    # Verify the signature
    await signature_verifier.verify(
        epoch_number=epoch_number,
        request=request,
    )

    # Get or calculate UQ score of the user
    user_uq_score = await uq_score_getter.get_or_calculate(
        epoch_number=epoch_number,
        user_address=request.user_address,
        should_save=True,
    )

    # Calculate leverage by simulating the allocation
    new_allocations = [
        AllocationWithUserUQScore(
            project_address=a.project_address,
            amount=a.amount,
            user_address=request.user_address,
            user_uq_score=user_uq_score,
        )
        for a in request.allocations
    ]

    leverage = await simulate_leverage(
        session,
        projects_contracts,
        matched_rewards_estimator,
        epoch_number,
        new_allocations,
    )

    await soft_delete_user_allocations_by_epoch(
        session, request.user_address, epoch_number
    )

    # Get user and update allocation nonce
    user = await get_user_by_address(session, request.user_address)
    if user is None:
        raise exceptions.UserNotFound(request.user_address)

    user.allocation_nonce = request.nonce

    await store_allocation_request(
        session,
        request.user_address,
        epoch_number,
        request,
        leverage,
    )

    # Commit the transaction
    await session.commit()

    return request.user_address


async def simulate_allocation(
    # Component dependencies
    session: AsyncSession,
    projects_contracts: ProjectsContracts,
    matched_rewards_estimator: MatchedRewardsEstimator,
    uq_score_getter: UQScoreGetter,
    # Arguments
    epoch_number: int,
    user_address: Address,
    new_allocations: list[AllocationRequestV1],
) -> SimulateAllocationResponseV1:
    """
    Simulate the impact of a potential allocation.

    This function calculates:
    1. Allocation leverage
    2. Matched rewards distribution
    3. Project funding changes

    The simulation:
    - Ignores user's current allocations
    - Calculates new leverage
    - Shows potential matched rewards
    - Helps users make informed decisions

    Args:
        session: Database session
        projects_contracts: Project data service
        matched_rewards_estimator: Matched rewards calculator
        uq_score_getter: UQ score service
        epoch_number: Current epoch
        user_address: User's address
        new_allocations: Proposed allocations

    Returns:
        SimulateAllocationResponseV1: Simulation results including:
            - leverage: Calculated leverage
            - threshold: Not used
            - matched: Project reward distribution

    Note:
        - Does not persist changes
        - Uses capped quadratic funding
        - Considers user's UQ score
        - Shows potential impact
    """

    # Get or calculate UQ score of the user
    user_uq_score = await uq_score_getter.get_or_calculate(
        epoch_number=epoch_number,
        user_address=user_address,
        should_save=False,
    )
    new_allocations_with_uq = [
        AllocationWithUserUQScore(
            project_address=a.project_address,
            amount=a.amount,
            user_address=user_address,
            user_uq_score=user_uq_score,
        )
        for a in new_allocations
    ]

    # Calculate leverage and matched project rewards
    all_projects = await projects_contracts.get_project_addresses(epoch_number)
    existing_allocations = await get_allocations_with_user_uqs(session, epoch_number)
    matched_rewards = await matched_rewards_estimator.get()

    allocations_without_user = [
        a for a in existing_allocations if a.user_address != user_address
    ]

    # Calculate capped quadratic funding before and after the user's allocation
    # Leverage is more or less a difference between the two (before - after)
    before_allocation = capped_quadratic_funding(
        allocations_without_user,
        matched_rewards,
        all_projects,
        MR_FUNDING_CAP_PERCENT,
    )
    after_allocation = capped_quadratic_funding(
        allocations_without_user + new_allocations_with_uq,
        matched_rewards,
        all_projects,
        MR_FUNDING_CAP_PERCENT,
    )

    leverage = cqf_calculate_individual_leverage(
        new_allocations_amount=sum(a.amount for a in new_allocations_with_uq),
        project_addresses=[a.project_address for a in new_allocations_with_uq],
        before_allocation=before_allocation,
        after_allocation=after_allocation,
    )

    return SimulateAllocationResponseV1(
        leverage=leverage,
        threshold=None,
        matched=sorted(
            [
                ProjectMatchedRewardsV1(
                    address=p.address,
                    value=p.matched,
                )
                for p in after_allocation.project_fundings.values()
            ],
            key=lambda x: x.address,
        ),
    )


async def simulate_leverage(
    # Component dependencies
    session: AsyncSession,
    projects_contracts: ProjectsContracts,
    matched_rewards_estimator: MatchedRewardsEstimator,
    # Arguments
    epoch_number: int,
    new_allocations: list[AllocationWithUserUQScore],
) -> float:
    """
    Calculate the leverage of a user's allocation.

    This function computes the leverage impact of new allocations by:
    1. Getting all project addresses
    2. Retrieving matched rewards
    3. Getting existing allocations
    4. Calculating leverage using CQF

    Args:
        session: Database session
        projects_contracts: Project data service
        matched_rewards_estimator: Matched rewards calculator
        epoch_number: Current epoch
        new_allocations: User's new allocations

    Returns:
        float: Calculated leverage value

    Note:
        - Uses capped quadratic funding
        - Considers user's UQ score
        - Includes all project allocations
        - Calculates before/after impact
    """

    all_projects = await projects_contracts.get_project_addresses(epoch_number)
    matched_rewards = await matched_rewards_estimator.get()
    existing_allocations = await get_allocations_with_user_uqs(session, epoch_number)

    return cqf_simulate_leverage(
        existing_allocations=existing_allocations,
        new_allocations=new_allocations,
        matched_rewards=matched_rewards,
        project_addresses=all_projects,
    )

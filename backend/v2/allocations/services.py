from dataclasses import dataclass

from app import exceptions
from sqlalchemy.ext.asyncio import AsyncSession
from v2.uniqueness_quotients.dependencies import UQScoreGetter
from v2.project_rewards.capped_quadriatic import (
    cqf_simulate_leverage,
)
from v2.projects.contracts import ProjectsContracts
from v2.projects.services import (
    EstimatedProjectMatchedRewards,
)
from v2.users.repositories import get_user_by_address

from .validators import SignatureVerifier
from .schemas import AllocationWithUserUQScore, UserAllocationRequest
from .repositories import (
    get_allocations_with_user_uqs,
    soft_delete_user_allocations_by_epoch,
    store_allocation_request,
)


@dataclass
class Allocations:
    session: AsyncSession
    signature_verifier: SignatureVerifier
    uq_score_getter: UQScoreGetter
    projects: ProjectsContracts
    estimated_project_matched_rewards: EstimatedProjectMatchedRewards

    async def make(
        self,
        epoch_number: int,
        request: UserAllocationRequest,
    ) -> str:
        """
        Make an allocation for the user.
        """
        return await allocate(
            session=self.session,
            signature_verifier=self.signature_verifier,
            uq_score_getter=self.uq_score_getter,
            projects=self.projects,
            estimated_project_matched_rewards=self.estimated_project_matched_rewards,
            epoch_number=epoch_number,
            request=request,
        )


async def allocate(
    # Component dependencies
    session: AsyncSession,
    signature_verifier: SignatureVerifier,
    uq_score_getter: UQScoreGetter,
    projects: ProjectsContracts,
    estimated_project_matched_rewards: EstimatedProjectMatchedRewards,
    # Arguments
    epoch_number: int,
    request: UserAllocationRequest,
) -> str:
    # Verify the signature
    await signature_verifier.verify(
        epoch_number=epoch_number,
        request=request,
    )

    # Get or calculate UQ score of the user
    user_uq_score = await uq_score_getter.get_or_calculate(
        epoch_number=epoch_number,
        user_address=request.user_address,
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
        session=session,
        projects=projects,
        estimated_project_matched_rewards=estimated_project_matched_rewards,
        epoch_number=epoch_number,
        new_allocations=new_allocations,
    )

    await soft_delete_user_allocations_by_epoch(
        session,
        user_address=request.user_address,
        epoch_number=epoch_number,
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
        leverage=leverage,
    )

    # Commit the transaction
    await session.commit()

    return request.user_address


async def simulate_leverage(
    # Component dependencies
    session: AsyncSession,
    projects: ProjectsContracts,
    estimated_project_matched_rewards: EstimatedProjectMatchedRewards,
    # Arguments
    epoch_number: int,
    new_allocations: list[AllocationWithUserUQScore],
) -> float:
    """
    Calculate leverage of the allocation made by the user.
    """

    all_projects = await projects.get_project_addresses(epoch_number)

    matched_rewards = await estimated_project_matched_rewards.get(epoch_number)

    # Get all allocations before user's allocation
    existing_allocations = await get_allocations_with_user_uqs(session, epoch_number)

    return cqf_simulate_leverage(
        existing_allocations=existing_allocations,
        new_allocations=new_allocations,
        matched_rewards=matched_rewards,
        project_addresses=all_projects,
    )

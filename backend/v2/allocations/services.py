import asyncio
from dataclasses import dataclass

from app import exceptions
from sqlalchemy.ext.asyncio import AsyncSession
from v2.allocations.repositories import (
    get_allocations_with_user_uqs,
    soft_delete_user_allocations_by_epoch,
    store_allocation_request,
)
from v2.allocations.schemas import AllocationWithUserUQScore, UserAllocationRequest
from v2.allocations.validators import SignatureVerifier
from v2.matched_rewards.services import MatchedRewardsEstimator
from v2.project_rewards.capped_quadriatic import cqf_simulate_leverage
from v2.projects.contracts import ProjectsContracts
from v2.uniqueness_quotients.dependencies import UQScoreGetter
from v2.users.repositories import get_user_by_address


@dataclass
class Allocator:
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
        Make an allocation for the user.
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
            projectAddress=a.project_address,
            amount=a.amount,
            userAddress=request.user_address,
            userUqScore=user_uq_score,
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
    Calculate leverage of the allocation made by the user.
    """

    all_projects, matched_rewards, existing_allocations = await asyncio.gather(
        projects_contracts.get_project_addresses(epoch_number),
        matched_rewards_estimator.get(),
        get_allocations_with_user_uqs(session, epoch_number),
    )

    return cqf_simulate_leverage(
        existing_allocations=existing_allocations,
        new_allocations=new_allocations,
        matched_rewards=matched_rewards,
        project_addresses=all_projects,
    )

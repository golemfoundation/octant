from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession
from web3 import AsyncWeb3

from app import exceptions
from app.modules.common.crypto.signature import EncodingStandardFor, encode_for_signing
from v2.crypto.eip712 import build_allocations_eip712_structure
from v2.allocations.repositories import get_last_allocation_request_nonce
from v2.allocations.schemas import UserAllocationRequest
from v2.core.types import Address
from v2.crypto.signatures import verify_signed_message
from v2.epochs.subgraphs import EpochsSubgraph
from v2.projects.contracts import ProjectsContracts
from v2.user_patron_mode.repositories import (
    get_budget_by_user_address_and_epoch,
    user_is_patron_with_budget,
)


@dataclass
class SignatureVerifier:
    session: AsyncSession
    epochs_subgraph: EpochsSubgraph
    projects_contracts: ProjectsContracts
    chain_id: int

    async def verify(self, epoch_number: int, request: UserAllocationRequest) -> None:
        await verify_logic(
            session=self.session,
            epoch_subgraph=self.epochs_subgraph,
            projects_contracts=self.projects_contracts,
            epoch_number=epoch_number,
            payload=request,
        )

        await verify_signature(
            w3=self.projects_contracts.w3,
            chain_id=self.chain_id,
            user_address=request.user_address,
            payload=request,
        )


async def verify_logic(
    # Component dependencies
    session: AsyncSession,
    epoch_subgraph: EpochsSubgraph,
    projects_contracts: ProjectsContracts,
    # Arguments
    epoch_number: int,
    payload: UserAllocationRequest,
):
    # Check if the epoch is in the decision window
    # epoch_details = await epoch_subgraph.get_epoch_by_number(epoch_number)
    # if epoch_details.state != "PENDING":
    #     raise exceptions.NotInDecision

    # Check if the allocations are not empty
    if not payload.allocations:
        raise exceptions.EmptyAllocations()

    async def _check_database():
        await _provided_nonce_matches_expected(
            session, payload.user_address, payload.nonce
        )
        await _user_is_not_patron(
            session, epoch_subgraph, payload.user_address, epoch_number
        )
        await _user_has_budget(session, payload, epoch_number)

    await _check_database()
    await _provided_projects_are_correct(projects_contracts, epoch_number, payload)


async def _provided_nonce_matches_expected(
    # Component dependencies
    session: AsyncSession,
    # Arguments
    user_address: Address,
    nonce: int,
) -> None:
    """
    Check if the nonce is as expected.
    """
    # Get the next nonce
    next_nonce = await get_next_user_nonce(session, user_address)

    # Check if the nonce is as expected
    if nonce != next_nonce:
        raise exceptions.WrongAllocationsNonce(nonce, next_nonce)


async def _user_is_not_patron(
    # Component dependencies
    session: AsyncSession,
    epoch_subgraph: EpochsSubgraph,
    # Arguments
    user_address: Address,
    epoch_number: int,
) -> None:
    """
    Check if the user is not a patron.
    """
    # Check if the user is not a patron
    epoch_details = await epoch_subgraph.get_epoch_by_number(epoch_number)
    is_patron = await user_is_patron_with_budget(
        session,
        user_address,
        epoch_number,
        epoch_details.finalized_timestamp.datetime(),
    )
    if is_patron:
        raise exceptions.NotAllowedInPatronMode(user_address)


async def get_next_user_nonce(
    # Component dependencies
    session: AsyncSession,
    # Arguments
    user_address: Address,
) -> int:
    """
    Get the next expected nonce for the user.
    It's a simple increment of the last nonce, or 0 if there is no previous nonce.
    """
    # Get the last allocation request of the user
    last_allocation_request = await get_last_allocation_request_nonce(
        session, user_address
    )

    # Calculate the next nonce
    if last_allocation_request is None:
        return 0

    # Increment the last nonce
    return last_allocation_request + 1


async def _provided_projects_are_correct(
    # Component dependencies
    projects_contracts: ProjectsContracts,
    # Arguments
    epoch_number: int,
    payload: UserAllocationRequest,
) -> None:
    """
    Check if the projects in the allocation request are correct.
    """

    # Check if the user is not a project
    all_projects = await projects_contracts.get_project_addresses(epoch_number)
    if payload.user_address in all_projects:
        raise exceptions.ProjectAllocationToSelf()

    project_addresses = [a.project_address for a in payload.allocations]

    # Check if the projects are valid
    invalid_projects = set(project_addresses) - set(all_projects)
    if invalid_projects:
        raise exceptions.InvalidProjects(invalid_projects)

    # Check if there are no duplicates
    duplicates = [p for p in project_addresses if project_addresses.count(p) > 1]
    if duplicates:
        raise exceptions.DuplicatedProjects(duplicates)


async def _user_has_budget(
    # Component dependencies
    session: AsyncSession,
    # Arguments
    payload: UserAllocationRequest,
    epoch_number: int,
) -> None:
    """
    Check if the user has enough budget for the allocation.
    Check if the sum of the allocations is within the user's budget.
    """

    # Get the user's budget
    user_budget = await get_budget_by_user_address_and_epoch(
        session, payload.user_address, epoch_number
    )

    if user_budget is None:
        raise exceptions.BudgetNotFound(payload.user_address, epoch_number)

    # Check if the allocations are within the budget
    if sum(a.amount for a in payload.allocations) > user_budget:
        raise exceptions.RewardsBudgetExceeded()


async def verify_signature(
    w3: AsyncWeb3, chain_id: int, user_address: Address, payload: UserAllocationRequest
) -> None:
    eip712_encoded = build_allocations_eip712_structure(chain_id, payload)
    encoded_msg = encode_for_signing(EncodingStandardFor.DATA, eip712_encoded)

    # Verify the signature
    is_valid = await verify_signed_message(
        w3, user_address, encoded_msg, payload.signature
    )
    if not is_valid:
        raise exceptions.InvalidSignature(user_address, payload.signature)

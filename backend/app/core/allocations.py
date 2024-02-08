from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional

from dataclass_wizard import JSONWizard
from eth_utils import to_checksum_address

from app import database, exceptions
from app.controllers import rewards
from app.core.epochs.epoch_snapshots import has_pending_epoch_snapshot
from app.core.user.budget import get_budget
from app.core.user.patron_mode import get_patron_mode_status

from app.crypto.eip712 import recover_address, build_allocations_eip712_data
from app.extensions import proposals

from app.database.models import User


@dataclass(frozen=True)
class Allocation(JSONWizard):
    proposal_address: str
    amount: int


@dataclass(frozen=True)
class AllocationRequest:
    payload: Dict
    signature: str
    override_existing_allocations: bool


def add_allocations_to_db(
    epoch: int,
    user_address: str,
    nonce: int,
    allocations: List[Allocation],
    delete_existing_user_epoch_allocations: bool,
):
    user = database.user.get_by_address(user_address)
    if not user:
        user = database.user.add_user(user_address)

    if delete_existing_user_epoch_allocations:
        revoke_previous_allocation(user.address, epoch)

    database.allocations.add_all(epoch, user.id, nonce, allocations)


def store_allocation_request(
    epoch: int,
    user_address: str,
    nonce: int,
    signature: str,
    is_manually_edited: Optional[bool] = None,
):
    database.allocations.add_allocation_request(
        user_address, epoch, nonce, signature, is_manually_edited
    )


def recover_user_address(request: AllocationRequest) -> str:
    eip712_data = build_allocations_eip712_data(request.payload)
    return recover_address(eip712_data, request.signature)


def deserialize_payload(payload) -> Tuple[int, List[Allocation]]:
    allocations = [
        Allocation.from_dict(allocation_data)
        for allocation_data in payload["allocations"]
    ]
    return payload["nonce"], allocations


def verify_allocations(
    epoch: Optional[int], user_address: str, allocations: List[Allocation]
):
    if epoch is None:
        raise exceptions.NotInDecisionWindow

    if not has_pending_epoch_snapshot(epoch):
        raise exceptions.MissingSnapshot

    patron_mode_enabled = get_patron_mode_status(
        user_address=to_checksum_address(user_address)
    )
    if patron_mode_enabled:
        raise exceptions.NotAllowedInPatronMode(user_address)

    # Check if allocations list is empty
    if len(allocations) == 0:
        raise exceptions.EmptyAllocations()

    # Check if the list of proposal addresses is a subset of
    # proposal addresses in the Proposals contract
    proposal_addresses = [a.proposal_address for a in allocations]
    valid_proposals = proposals.get_proposal_addresses(epoch)
    invalid_proposals = list(set(proposal_addresses) - set(valid_proposals))

    if invalid_proposals:
        raise exceptions.InvalidProposals(invalid_proposals)

    # Check if any allocation address has been duplicated in the payload
    [proposal_addresses.remove(p) for p in set(proposal_addresses)]

    if proposal_addresses:
        raise exceptions.DuplicatedProposals(proposal_addresses)

    # Check if user address is not in one of the allocations
    for allocation in allocations:
        if allocation.proposal_address == user_address:
            raise exceptions.ProposalAllocateToItself

    # Check if user didn't exceed his budget
    user_budget = get_budget(user_address, epoch)
    proposals_sum = sum([a.amount for a in allocations])

    if proposals_sum > user_budget:
        raise exceptions.RewardsBudgetExceeded


def revoke_previous_allocation(user_address: str, epoch: int):
    user = database.user.get_by_address(user_address)
    if user is None:
        raise exceptions.UserNotFound

    database.allocations.soft_delete_all_by_epoch_and_user_id(epoch, user.id)


def calculate_user_allocations_leverage(
    proposal_rewards: List[rewards.ProposalReward],
) -> float:
    allocated = sum(map(lambda x: x.allocated, proposal_rewards))

    if allocated == 0:
        raise exceptions.EmptyAllocations()

    matched_funds = sum(map(lambda x: x.matched, proposal_rewards))

    return matched_funds / allocated


def next_allocation_nonce(user: User | None) -> int:
    if user is None:
        return 0
    if user.allocation_nonce is None:
        return 0
    return user.allocation_nonce + 1


def has_user_allocated_rewards(user_address: str, epoch: int) -> List[str]:
    allocation_signature = (
        database.allocations.get_allocation_request_by_user_and_epoch(
            user_address, epoch
        )
    )
    return allocation_signature is not None

from typing import List
from random import randint

from app.modules.dto import (
    AllocationItem,
    UserAllocationPayload,
    UserAllocationRequestPayload,
)
from app.infrastructure import database


def create_payload(proposals, amounts: list[int] | None, nonce: int = 0):
    if amounts is None:
        amounts = [randint(1 * 10**18, 1000 * 10**18) for _ in proposals]

    allocations = [
        {
            "proposalAddress": proposal.address,
            "amount": str(amount),
        }
        for proposal, amount in zip(proposals, amounts)
    ]

    return {"allocations": allocations, "nonce": nonce}


def deserialize_allocations(payload) -> List[AllocationItem]:
    return [
        AllocationItem(
            proposal_address=allocation_data["proposalAddress"],
            amount=int(allocation_data["amount"]),
        )
        for allocation_data in payload["allocations"]
    ]


def make_user_allocation(context, user, allocations=1, nonce=0, **kwargs):
    projects = context.projects_details.projects
    database.allocations.soft_delete_all_by_epoch_and_user_id(
        context.epoch_details.epoch_num, user.id
    )

    allocation_items = [
        AllocationItem(projects[i], (i + 1) * 100) for i in range(allocations)
    ]

    if kwargs.get("allocation_items"):
        allocation_items = kwargs.get("allocation_items")

    request = UserAllocationRequestPayload(
        payload=UserAllocationPayload(allocations=allocation_items, nonce=nonce),
        signature="0xdeadbeef",
    )

    database.allocations.store_allocation_request(
        user.address, context.epoch_details.epoch_num, request, **kwargs
    )

    return allocation_items

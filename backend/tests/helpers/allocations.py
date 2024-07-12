from typing import List
from random import randint

from app import db
from app.modules.dto import (
    AllocationItem,
    UserAllocationPayload,
    UserAllocationRequestPayload,
)
from app.infrastructure import database
from tests.helpers.constants import LOW_UQ_SCORE


def create_payload(projects, amounts: list[int] | None, nonce: int = 0):
    if amounts is None:
        amounts = [randint(1 * 10**18, 1000 * 10**18) for _ in projects]

    allocations = [
        {
            "proposalAddress": proposal.address,
            "amount": str(amount),
        }
        for proposal, amount in zip(projects, amounts)
    ]

    return {"allocations": allocations, "nonce": nonce}


def deserialize_allocations(payload) -> List[AllocationItem]:
    return [
        AllocationItem(
            project_address=allocation_data["proposalAddress"],
            amount=int(allocation_data["amount"]),
        )
        for allocation_data in payload["allocations"]
    ]


def make_user_allocation(context, user, allocations=1, nonce=0, **kwargs):
    return _make_allocation(context, user, allocations, nonce, **kwargs)


def make_user_allocation_with_uq_score(
    context, user, epoch, allocations=1, nonce=0, uq_score=LOW_UQ_SCORE, **kwargs
):
    allocation = _make_allocation(context, user, allocations, nonce, **kwargs)
    database.uniqueness_quotient.save_uq(user, epoch, uq_score)
    db.session.commit()

    return allocation


def _make_allocation(context, user, allocations=1, nonce=0, **kwargs):
    projects = context.projects_details.projects
    database.allocations.soft_delete_all_by_epoch_and_user_id(
        context.epoch_details.epoch_num, user.id
    )

    if kwargs.get("allocation_items"):
        allocation_items = kwargs.get("allocation_items")
    else:
        allocation_items = []

        for i in range(allocations):
            allocation_items.append(AllocationItem(projects[i], (i + 1) * 100))

    request = UserAllocationRequestPayload(
        payload=UserAllocationPayload(allocations=allocation_items, nonce=nonce),
        signature="0xdeadbeef",
    )

    database.allocations.store_allocation_request(
        user.address, context.epoch_details.epoch_num, request, **kwargs
    )

    return allocation_items


def mock_request(nonce):
    fake_signature = "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"

    return UserAllocationRequestPayload(
        payload=UserAllocationPayload([], nonce), signature=fake_signature
    )

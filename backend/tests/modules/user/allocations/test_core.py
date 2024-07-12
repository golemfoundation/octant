import pytest

from app import exceptions
from app.context.epoch_state import EpochState
from app.modules.dto import (
    UserAllocationPayload,
    UserAllocationRequestPayload,
    AllocationItem,
)
from app.modules.user.allocations import core

from tests.helpers.context import get_context


@pytest.fixture()
def context(projects):
    return get_context(epoch_state=EpochState.PENDING, projects=projects[:4])


def build_allocations(allocs):
    return [
        AllocationItem(project_address=project, amount=amount)
        for project, amount in allocs
    ]


def build_request(allocations=None, nonce=0):
    allocations = allocations if allocations else []

    return UserAllocationRequestPayload(
        payload=UserAllocationPayload(allocations, nonce=nonce),
        signature="0xdeadbeef",  # signature is implicitly checked at user_address recovery
    )


def test_allocation_fails_outside_allocation_window(alice):
    request = build_request(alice)

    for state in [
        EpochState.FUTURE,
        EpochState.CURRENT,
        EpochState.FINALIZING,
        EpochState.FINALIZED,
    ]:
        context = get_context(epoch_state=state)
        with pytest.raises(exceptions.NotInDecisionWindow):
            core.verify_user_allocation_request(
                context, request, alice.address, 0, 10**18, []
            )

    context = get_context(epoch_state=EpochState.PRE_PENDING)
    with pytest.raises(exceptions.MissingSnapshot):
        core.verify_user_allocation_request(
            context, request, alice.address, 0, 10**18, []
        )


def test_allocation_fails_for_invalid_nonce(alice, context):
    with pytest.raises(exceptions.WrongAllocationsNonce):
        request = build_request(alice, nonce=0)
        core.verify_user_allocation_request(
            context, request, alice.address, 1, 10**18, []
        )

    with pytest.raises(exceptions.WrongAllocationsNonce):
        request = build_request(nonce=2)
        core.verify_user_allocation_request(
            context, request, alice.address, 1, 10**18, []
        )

    with pytest.raises(exceptions.WrongAllocationsNonce):
        request = build_request(nonce=None)
        core.verify_user_allocation_request(
            context, request, alice.address, 1, 10**18, []
        )


def test_allocation_fails_for_a_patron(alice, bob, context):
    request = build_request(alice)
    with pytest.raises(exceptions.NotAllowedInPatronMode):
        core.verify_user_allocation_request(
            context, request, alice.address, 0, 10**18, [bob.address, alice.address]
        )


def test_allocation_fails_for_a_project(context):
    request = build_request()
    with pytest.raises(exceptions.ProjectAllocationToSelf):
        core.verify_user_allocation_request(
            context, request, context.projects_details.projects[1], 0, 10**18, []
        )


def test_allocation_fails_with_empty_payload(alice, bob, context):
    request = build_request(allocations=[])
    with pytest.raises(exceptions.EmptyAllocations):
        core.verify_user_allocation_request(
            context, request, alice.address, 0, 10**18, [bob.address]
        )


def test_allocation_fails_with_invalid_projects(alice, bob, context, projects):
    valid_projects = context.projects_details.projects
    valid_allocations = [(p, 17 * 10**16) for p in valid_projects]

    allocations = build_allocations(valid_allocations + [(projects[4], 17 * 10**16)])
    request = build_request(allocations)

    with pytest.raises(exceptions.InvalidProjects):
        core.verify_user_allocation_request(
            context, request, alice.address, 0, 10**18, [bob.address]
        )


def test_allocation_fails_with_duplicated_projects(alice, bob, context):
    projects = context.projects_details.projects
    allocations = build_allocations(
        [(p, 17 * 10**16) for p in projects] + [(projects[1], 1)]
    )
    request = build_request(allocations)

    with pytest.raises(exceptions.DuplicatedProjects):
        core.verify_user_allocation_request(
            context, request, alice.address, 0, 10**18, [bob.address]
        )


def test_allocation_fails_with_self_allocation(alice, bob, context):
    projects = context.projects_details.projects

    allocations = build_allocations([(p, 17 * 10**16) for p in projects])
    request = build_request(allocations)

    with pytest.raises(exceptions.ProjectAllocationToSelf):
        core.verify_user_allocation_request(
            context, request, projects[1], 0, 10**18, [bob.address]
        )


def test_allocation_fails_with_allocation_exceeding_budget(alice, bob, context):
    projects = context.projects_details.projects

    allocations = build_allocations(
        [
            (projects[0], 25 * 10**16),
            (projects[1], 25 * 10**16),
            (projects[2], 25 * 10**16 + 1),
            (projects[3], 25 * 10**16),
        ]
    )
    request = build_request(allocations)

    with pytest.raises(exceptions.RewardsBudgetExceeded):
        core.verify_user_allocation_request(
            context, request, alice.address, 0, 10**18, [bob.address]
        )


def test_allocation_does_not_fail_with_allocation_equal_to_budget(alice, bob, context):
    projects = context.projects_details.projects

    allocations = build_allocations(
        [
            (projects[0], 25 * 10**16),
            (projects[1], 25 * 10**16),
            (projects[2], 25 * 10**16),
            (projects[3], 25 * 10**16),
        ]
    )
    request = build_request(allocations)

    assert (
        core.verify_user_allocation_request(
            context, request, alice.address, 0, 10**18, [bob.address]
        )
        is None
    )


def test_allocation_does_not_fail_with_allocation_below_budget(alice, bob, context):
    projects = context.projects_details.projects
    allocations = build_allocations(
        [
            (projects[0], 25 * 10**16),
            (projects[1], 25 * 10**16),
            (projects[3], 25 * 10**16),
        ]
    )
    request = build_request(allocations)

    assert (
        core.verify_user_allocation_request(
            context, request, alice.address, 0, 10**18, [bob.address]
        )
        is None
    )

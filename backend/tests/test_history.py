import dataclasses
from typing import List

import pytest
from eth_account.signers.local import LocalAccount

from app.core.allocations import allocate, AllocationRequest
from app.core.history import (
    get_locks,
    get_unlocks,
    get_allocations,
    AllocationItem,
    get_withdrawals,
)
from app.crypto.eip712 import sign, build_allocations_eip712_data
from app.extensions import graphql_client
from tests.conftest import create_payload, MOCK_PROPOSALS, MOCK_EPOCHS


@pytest.fixture(autouse=True)
def before(
    proposal_accounts,
    patch_epochs,
    patch_proposals,
    patch_has_pending_epoch_snapshot,
    patch_user_budget,
):
    MOCK_PROPOSALS.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts[0:5]
    ]


@pytest.mark.parametrize(
    "locks, unlocks, expected_history",
    [
        (  # Case 1: unlock value in the middle
            [
                {
                    "__typename": "Locked",
                    "amount": "500000000000000000000",
                    "timestamp": 1679645896,
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1679645700,
                },
            ],
            [
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1679645800,
                },
            ],
            [
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": 1679645700 * 10**6,
                },
                {
                    "type": "unlock",
                    "amount": 400000000000000000000,
                    "timestamp": 1679645800 * 10**6,
                },
                {
                    "type": "lock",
                    "amount": 500000000000000000000,
                    "timestamp": 1679645896 * 10**6,
                },
            ],
        ),
        (  # Case 2: unlock value first
            [
                {
                    "__typename": "Locked",
                    "amount": "500000000000000000000",
                    "timestamp": 1679645900,
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1679645910,
                },
            ],
            [
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1679645950,
                },
            ],
            [
                {
                    "type": "lock",
                    "amount": 500000000000000000000,
                    "timestamp": 1679645900 * 10**6,
                },
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": 1679645910 * 10**6,
                },
                {
                    "type": "unlock",
                    "amount": 400000000000000000000,
                    "timestamp": 1679645950 * 10**6,
                },
            ],
        ),
        (  # Case 3: more unlock values than lock values
            [
                {
                    "__typename": "Locked",
                    "amount": "500000000000000000000",
                    "timestamp": 1679645900,
                },
            ],
            [
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1679645800,
                },
                {
                    "__typename": "Unlocked",
                    "amount": "600000000000000000000",
                    "timestamp": 1679646000,
                },
            ],
            [
                {
                    "type": "unlock",
                    "amount": 400000000000000000000,
                    "timestamp": 1679645800 * 10**6,
                },
                {
                    "type": "lock",
                    "amount": 500000000000000000000,
                    "timestamp": 1679645900 * 10**6,
                },
                {
                    "type": "unlock",
                    "amount": 600000000000000000000,
                    "timestamp": 1679646000 * 10**6,
                },
            ],
        ),
        (  # Case 4: empty lists
            [],
            [],
            [],
        ),
    ],
    ids=[
        "Case 1: unlock value in the middle",
        "Case 2: unlock value first",
        "Case 3: more unlock values than lock values",
        "Case 4: empty lists",
    ],
)
def test_history_locks(mocker, locks, unlocks, expected_history, app):
    # Mock the execute method of the GraphQL client
    mocker.patch.object(graphql_client, "execute")

    # Define the mock responses for the execute method
    graphql_client.execute.side_effect = [
        {"lockeds": locks},
        {"unlockeds": unlocks},
    ]

    user_address = "0xca50c6c165d19ab38cc7935ff84f214a483a5494"

    # Test various functions from core/history
    history = get_locks(user_address, 0) + get_unlocks(user_address, 0)
    history = [
        dataclasses.asdict(item) for item in sorted(history, key=lambda x: x.timestamp)
    ]

    assert history == expected_history


@pytest.mark.parametrize(
    "withdrawals, expected_history_sorted_by_ts",
    [
        (
            [
                {
                    "user": "0x1000000000000000000000000000000000000000",
                    "amount": 100000000000000000000,
                    "timestamp": 200,
                },
                {
                    "user": "0x1000000000000000000000000000000000000000",
                    "amount": 200000000000000000000,
                    "timestamp": 100,
                },
            ],
            [
                {
                    "address": "0x1000000000000000000000000000000000000000",
                    "amount": 200000000000000000000,
                    "timestamp": 100 * 10**6,
                },
                {
                    "address": "0x1000000000000000000000000000000000000000",
                    "amount": 100000000000000000000,
                    "timestamp": 200 * 10**6,
                },
            ],
        ),
        (
            [
                {
                    "user": "0x1000000000000000000000000000000000000000",
                    "amount": 300000000000000000000,
                    "timestamp": 100,
                },
            ],
            [
                {
                    "address": "0x1000000000000000000000000000000000000000",
                    "amount": 300000000000000000000,
                    "timestamp": 100 * 10**6,
                },
            ],
        ),
        (
            [],
            [],
        ),
    ],
)
def test_history_withdrawals(mocker, withdrawals, expected_history_sorted_by_ts, app):
    # Mock the execute method of the GraphQL client
    mocker.patch.object(graphql_client, "execute")

    # Define the mock responses for the execute method
    graphql_client.execute.side_effect = [{"withdrawals": withdrawals}]

    history = get_withdrawals("0x1000000000000000000000000000000000000000", 0)
    history = [
        dataclasses.asdict(item) for item in sorted(history, key=lambda x: x.timestamp)
    ]

    assert history == expected_history_sorted_by_ts


def test_history_allocations(app, proposal_accounts, user_accounts):
    # Setup constant data
    proposals = proposal_accounts[0:3]
    user1: LocalAccount = user_accounts[0]

    # Test data for epoch no 3
    payload = create_payload(proposals, [100, 200, 300])
    signature = sign(user1, build_allocations_eip712_data(payload))
    MOCK_EPOCHS.get_pending_epoch.return_value = 3

    allocate(
        AllocationRequest(
            payload=payload,
            signature=signature,
            override_existing_allocations=True,
        )
    )

    allocs = _allocation_items_to_tuples(get_allocations(user1.address, 0))

    assert _compare_two_unordered_lists(
        allocs,
        [
            (proposals[0].address, 3, 100),
            (proposals[1].address, 3, 200),
            (proposals[2].address, 3, 300),
        ],
    )

    # Allocate different data, but for the same epoch no 3
    payload = create_payload(proposals, [200, 200, 400])
    signature = sign(user1, build_allocations_eip712_data(payload))

    allocate(
        AllocationRequest(
            payload=payload,
            signature=signature,
            override_existing_allocations=True,
        )
    )

    allocs = _allocation_items_to_tuples(get_allocations(user1.address, 0))

    assert _compare_two_unordered_lists(
        allocs,
        [
            (proposals[0].address, 3, 100),
            (proposals[1].address, 3, 200),
            (proposals[2].address, 3, 300),
            (proposals[0].address, 3, 200),
            (proposals[1].address, 3, 200),
            (proposals[2].address, 3, 400),
        ],
    )

    # Allocate data, for different epoch (no 4)
    payload = create_payload(proposals, [10, 20, 30])
    signature = sign(user1, build_allocations_eip712_data(payload))
    MOCK_EPOCHS.get_pending_epoch.return_value = 4

    allocate(
        AllocationRequest(
            payload=payload,
            signature=signature,
            override_existing_allocations=True,
        )
    )

    allocs = _allocation_items_to_tuples(get_allocations(user1.address, 0))

    assert _compare_two_unordered_lists(
        allocs,
        [
            (proposals[0].address, 3, 100),
            (proposals[1].address, 3, 200),
            (proposals[2].address, 3, 300),
            (proposals[0].address, 3, 200),
            (proposals[1].address, 3, 200),
            (proposals[2].address, 3, 400),
            (proposals[0].address, 4, 10),
            (proposals[1].address, 4, 20),
            (proposals[2].address, 4, 30),
        ],
    )


def _allocation_items_to_tuples(allocation_items: List[AllocationItem]) -> List[tuple]:
    return [(a.address, a.epoch, a.amount) for a in allocation_items]


def _compare_two_unordered_lists(list1, list2) -> bool:
    if len(list1) != len(list2):
        return False

    for i in list1:
        if i not in list2:
            return False

    return True

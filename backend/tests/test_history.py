import dataclasses
import math
from typing import List

import pytest
from eth_account.signers.local import LocalAccount

from app.controllers.allocations import allocate
from app.controllers.history import user_history
from app.core.allocations import AllocationRequest
from app.core.history import (
    get_locks,
    get_unlocks,
    get_allocations,
    AllocationItem,
    get_withdrawals,
)
from app.crypto.eip712 import sign, build_allocations_eip712_data
from app.utils.time import from_timestamp_s, now

from tests.conftest import (
    create_payload,
    MOCK_PROPOSALS,
    MOCK_EPOCHS,
    USER1_ADDRESS,
    mock_graphql,
)


@pytest.fixture(autouse=True)
def before(
    app,
    graphql_client,
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
                    "timestamp": from_timestamp_s(1679645700),
                },
                {
                    "type": "unlock",
                    "amount": 400000000000000000000,
                    "timestamp": from_timestamp_s(1679645800),
                },
                {
                    "type": "lock",
                    "amount": 500000000000000000000,
                    "timestamp": from_timestamp_s(1679645896),
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
                    "timestamp": from_timestamp_s(1679645900),
                },
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": from_timestamp_s(1679645910),
                },
                {
                    "type": "unlock",
                    "amount": 400000000000000000000,
                    "timestamp": from_timestamp_s(1679645950),
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
                    "timestamp": from_timestamp_s(1679645800),
                },
                {
                    "type": "lock",
                    "amount": 500000000000000000000,
                    "timestamp": from_timestamp_s(1679645900),
                },
                {
                    "type": "unlock",
                    "amount": 600000000000000000000,
                    "timestamp": from_timestamp_s(1679646000),
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
def test_history_locks(mocker, locks, unlocks, expected_history):
    mock_graphql(mocker, deposit_events=locks + unlocks)
    user_address = USER1_ADDRESS

    # Test various functions from core/history
    history = get_locks(user_address, from_timestamp_s(1679647000), 100) + get_unlocks(
        user_address, from_timestamp_s(1679647000), 100
    )
    history = [
        dataclasses.asdict(item)
        for item in sorted(history, key=lambda x: x.timestamp.timestamp_us())
    ]

    assert history == expected_history


@pytest.mark.parametrize(
    "withdrawals, expected_history_sorted_by_ts",
    [
        (
            [
                {
                    "user": "0x1000000000000000000000000000000000000000",
                    "amount": 200000000000000000000,
                    "timestamp": 100,
                },
                {
                    "user": "0x1000000000000000000000000000000000000000",
                    "amount": 100000000000000000000,
                    "timestamp": 200,
                },
            ],
            [
                {
                    "address": "0x1000000000000000000000000000000000000000",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(200),
                },
                {
                    "address": "0x1000000000000000000000000000000000000000",
                    "amount": 200000000000000000000,
                    "timestamp": from_timestamp_s(100),
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
                    "timestamp": from_timestamp_s(100),
                },
            ],
        ),
        (
            [],
            [],
        ),
    ],
)
def test_history_withdrawals(mocker, withdrawals, expected_history_sorted_by_ts):
    mock_graphql(mocker, withdrawals_events=withdrawals)

    history = get_withdrawals(
        "0x1000000000000000000000000000000000000000", from_timestamp_s(300), 100
    )

    history = [dataclasses.asdict(i) for i in history]

    assert history == expected_history_sorted_by_ts


def test_history_allocations(proposal_accounts, tos_users):
    # Setup constant data
    proposals = proposal_accounts[0:3]
    user1: LocalAccount = tos_users[0]

    # Test data for epoch no 3
    payload = create_payload(proposals, [100, 200, 300], 0)
    signature = sign(user1, build_allocations_eip712_data(payload))
    MOCK_EPOCHS.get_pending_epoch.return_value = 3

    allocate(
        AllocationRequest(
            payload=payload,
            signature=signature,
            override_existing_allocations=True,
        )
    )

    # query timestamp is set to now since allocation flow creates allocations at current timestamp
    allocs = _allocation_items_to_tuples(get_allocations(user1.address, now(), 100))

    assert _compare_two_unordered_lists(
        allocs,
        [
            (proposals[0].address, 3, 100),
            (proposals[1].address, 3, 200),
            (proposals[2].address, 3, 300),
        ],
    )

    # Allocate different data, but for the same epoch no 3
    payload = create_payload(proposals, [200, 200, 400], 1)
    signature = sign(user1, build_allocations_eip712_data(payload))

    allocate(
        AllocationRequest(
            payload=payload,
            signature=signature,
            override_existing_allocations=True,
        )
    )

    # query timestamp is set to now since allocation flow creates allocations at current timestamp
    allocs = _allocation_items_to_tuples(get_allocations(user1.address, now(), 100))

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
    payload = create_payload(proposals, [10, 20, 30], 2)
    signature = sign(user1, build_allocations_eip712_data(payload))
    MOCK_EPOCHS.get_pending_epoch.return_value = 4

    allocate(
        AllocationRequest(
            payload=payload,
            signature=signature,
            override_existing_allocations=True,
        )
    )

    allocs = _allocation_items_to_tuples(get_allocations(user1.address, now(), 100))

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


@pytest.mark.parametrize("page_limit", [1, 2, 3, 5, 8, 13])
@pytest.mark.parametrize(
    "deposits, withdrawals, expected_history",
    [
        (  # Case 1: long, linear history
            [
                {
                    "__typename": "Locked",
                    "amount": "500000000000000000000",
                    "timestamp": 1000000001,
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1000000002,
                },
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1000000003,
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1000000004,
                },
                {
                    "__typename": "Unlocked",
                    "amount": "100000000000000000000",
                    "timestamp": 1000000006,
                },
                {
                    "__typename": "Unlocked",
                    "amount": "100000000000000000000",
                    "timestamp": 1000000007,
                },
            ],
            [
                {
                    "user": USER1_ADDRESS,
                    "amount": 100000000000000000000,
                    "timestamp": 1000000005,
                },
                {
                    "user": USER1_ADDRESS,
                    "amount": 100000000000000000000,
                    "timestamp": 1000000008,
                },
            ],
            [
                {
                    "type": "withdrawal",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000008).timestamp_us(),
                },
                {
                    "type": "unlock",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000007).timestamp_us(),
                },
                {
                    "type": "unlock",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000006).timestamp_us(),
                },
                {
                    "type": "withdrawal",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000005).timestamp_us(),
                },
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": from_timestamp_s(1000000004).timestamp_us(),
                },
                {
                    "type": "unlock",
                    "amount": 400000000000000000000,
                    "timestamp": from_timestamp_s(1000000003).timestamp_us(),
                },
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": from_timestamp_s(1000000002).timestamp_us(),
                },
                {
                    "type": "lock",
                    "amount": 500000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                },
            ],
        ),
        (  # Case 2: events happening at the same timestamp
            [
                {
                    "__typename": "Locked",
                    "amount": "500000000000000000000",
                    "timestamp": 1000000001,
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1000000001,
                },
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1000000001,
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1000000001,
                },
                {
                    "__typename": "Unlocked",
                    "amount": "100000000000000000000",
                    "timestamp": 1000000001,
                },
                {
                    "__typename": "Unlocked",
                    "amount": "100000000000000000000",
                    "timestamp": 1000000001,
                },
            ],
            [
                {
                    "user": USER1_ADDRESS,
                    "amount": 100000000000000000000,
                    "timestamp": 1000000001,
                },
                {
                    "user": USER1_ADDRESS,
                    "amount": 100000000000000000000,
                    "timestamp": 1000000001,
                },
            ],
            [
                {
                    "type": "withdrawal",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                },
                {
                    "type": "withdrawal",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                },
                {
                    "type": "unlock",
                    "amount": 400000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                },
                {
                    "type": "unlock",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                },
                {
                    "type": "unlock",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                },
                {
                    "type": "lock",
                    "amount": 500000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                },
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                },
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                },
            ],
        ),
    ],
)
def test_complete_user_history(
    mocker,
    deposits,
    withdrawals,
    expected_history,
    page_limit,
    proposal_accounts,
    tos_users,
):
    # given

    mock_graphql(mocker, deposit_events=deposits, withdrawals_events=withdrawals)

    user1 = tos_users[0]
    proposals = proposal_accounts[0:3]
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

    allocations = get_allocations(user1.address, now(), 10)
    allocations = sorted(
        [
            {
                "type": "allocation",
                "amount": a.amount,
                "timestamp": a.timestamp.timestamp_us(),
            }
            for a in allocations
        ],
        key=lambda x: x["amount"],
        reverse=True,
    )

    assert len(allocations) == 3

    expected_history = allocations + expected_history

    # when

    expected_pages_no = math.ceil(len(expected_history) / page_limit)

    history = []
    cursor = None
    for i in range(0, expected_pages_no):
        curr_page, cursor = user_history(USER1_ADDRESS, cursor, limit=page_limit)

        history += curr_page

        if i + 1 != expected_pages_no:  # if not last page
            assert len(curr_page) == page_limit
            assert cursor is not None

    # then
    assert cursor is None

    assert len(history) == len(expected_history)
    assert [dataclasses.asdict(r) for r in history] == expected_history


def _allocation_items_to_tuples(allocation_items: List[AllocationItem]) -> List[tuple]:
    return [(a.address, a.epoch, a.amount) for a in allocation_items]


def _compare_two_unordered_lists(list1, list2) -> bool:
    if len(list1) != len(list2):
        return False

    for i in list1:
        if i not in list2:
            return False

    for i in list2:
        if i not in list1:
            return False

    return True

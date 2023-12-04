import dataclasses
import math
from typing import List

import pytest
from freezegun import freeze_time
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
    get_patron_mode_toggles,
    PatronModeToggleItem,
)
from app.core.user.patron_mode import toggle_patron_mode
from app.crypto.eip712 import sign, build_allocations_eip712_data
from app.utils.time import from_timestamp_s, now

from tests.conftest import (
    create_payload,
    MOCK_PROPOSALS,
    MOCK_EPOCHS,
    mock_graphql,
)
from tests.helpers.constants import USER1_ADDRESS


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
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000555555",
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1679645700,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000333333",
                },
            ],
            [
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1679645800,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000444444",
                },
            ],
            [
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": from_timestamp_s(1679645700),
                    "transaction_hash": "0xa16081f360e3847006db660bae1c000000333333",
                },
                {
                    "type": "unlock",
                    "amount": 400000000000000000000,
                    "timestamp": from_timestamp_s(1679645800),
                    "transaction_hash": "0xa16081f360e3847006db660bae1c000000444444",
                },
                {
                    "type": "lock",
                    "amount": 500000000000000000000,
                    "timestamp": from_timestamp_s(1679645896),
                    "transaction_hash": "0xa16081f360e3847006db660bae1c000000555555",
                },
            ],
        ),
        (  # Case 2: unlock value first
            [
                {
                    "__typename": "Locked",
                    "amount": "500000000000000000000",
                    "timestamp": 1679645900,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000555555",
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1679645910,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000333333",
                },
            ],
            [
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1679645950,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000444444",
                },
            ],
            [
                {
                    "type": "lock",
                    "amount": 500000000000000000000,
                    "timestamp": from_timestamp_s(1679645900),
                    "transaction_hash": "0xa16081f360e3847006db660bae1c000000555555",
                },
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": from_timestamp_s(1679645910),
                    "transaction_hash": "0xa16081f360e3847006db660bae1c000000333333",
                },
                {
                    "type": "unlock",
                    "amount": 400000000000000000000,
                    "timestamp": from_timestamp_s(1679645950),
                    "transaction_hash": "0xa16081f360e3847006db660bae1c000000444444",
                },
            ],
        ),
        (  # Case 3: more unlock values than lock values
            [
                {
                    "__typename": "Locked",
                    "amount": "500000000000000000000",
                    "timestamp": 1679645900,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000555555",
                },
            ],
            [
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1679645800,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000444444",
                },
                {
                    "__typename": "Unlocked",
                    "amount": "600000000000000000000",
                    "timestamp": 1679646000,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000666666",
                },
            ],
            [
                {
                    "type": "unlock",
                    "amount": 400000000000000000000,
                    "timestamp": from_timestamp_s(1679645800),
                    "transaction_hash": "0xa16081f360e3847006db660bae1c000000444444",
                },
                {
                    "type": "lock",
                    "amount": 500000000000000000000,
                    "timestamp": from_timestamp_s(1679645900),
                    "transaction_hash": "0xa16081f360e3847006db660bae1c000000555555",
                },
                {
                    "type": "unlock",
                    "amount": 600000000000000000000,
                    "timestamp": from_timestamp_s(1679646000),
                    "transaction_hash": "0xa16081f360e3847006db660bae1c000000666666",
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
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000222222",
                },
                {
                    "user": "0x1000000000000000000000000000000000000000",
                    "amount": 100000000000000000000,
                    "timestamp": 200,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000111111",
                },
            ],
            [
                {
                    "address": "0x1000000000000000000000000000000000000000",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(200),
                    "transaction_hash": "0xa16081f360e3847006db660bae1c000000111111",
                },
                {
                    "address": "0x1000000000000000000000000000000000000000",
                    "amount": 200000000000000000000,
                    "timestamp": from_timestamp_s(100),
                    "transaction_hash": "0xa16081f360e3847006db660bae1c000000222222",
                },
            ],
        ),
        (
            [
                {
                    "user": "0x1000000000000000000000000000000000000000",
                    "amount": 300000000000000000000,
                    "timestamp": 100,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000333333",
                },
            ],
            [
                {
                    "address": "0x1000000000000000000000000000000000000000",
                    "amount": 300000000000000000000,
                    "timestamp": from_timestamp_s(100),
                    "transaction_hash": "0xa16081f360e3847006db660bae1c000000333333",
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


@freeze_time("2023-11-01 01:48:47")
def test_history_patron_mode_toggles(tos_users):
    alice: LocalAccount = tos_users[0]

    toggle_patron_mode(alice.address)
    toggle_patron_mode(alice.address)

    history = get_patron_mode_toggles(alice.address, now(), 100)

    assert history == [
        PatronModeToggleItem(timestamp=now(), patron_mode_enabled=True),
        PatronModeToggleItem(timestamp=now(), patron_mode_enabled=False),
    ]

    history_with_small_limit = get_patron_mode_toggles(alice.address, now(), 1)
    assert history_with_small_limit == [
        PatronModeToggleItem(timestamp=now(), patron_mode_enabled=True),
        PatronModeToggleItem(timestamp=now(), patron_mode_enabled=False),
    ]


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
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000555555",
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1000000002,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000333333",
                },
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1000000003,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000444444",
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1000000004,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000333332",
                },
                {
                    "__typename": "Unlocked",
                    "amount": "100000000000000000000",
                    "timestamp": 1000000006,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000111113",
                },
                {
                    "__typename": "Unlocked",
                    "amount": "100000000000000000000",
                    "timestamp": 1000000007,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000111112",
                },
            ],
            [
                {
                    "user": USER1_ADDRESS,
                    "amount": 100000000000000000000,
                    "timestamp": 1000000005,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000111111",
                },
                {
                    "user": USER1_ADDRESS,
                    "amount": 100000000000000000000,
                    "timestamp": 1000000008,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000111115",
                },
            ],
            [
                {
                    "type": "withdrawal",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000008).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000111115",
                },
                {
                    "type": "unlock",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000007).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000111112",
                },
                {
                    "type": "unlock",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000006).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000111113",
                },
                {
                    "type": "withdrawal",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000005).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000111111",
                },
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": from_timestamp_s(1000000004).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000333332",
                },
                {
                    "type": "unlock",
                    "amount": 400000000000000000000,
                    "timestamp": from_timestamp_s(1000000003).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000444444",
                },
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": from_timestamp_s(1000000002).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000333333",
                },
                {
                    "type": "lock",
                    "amount": 500000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000555555",
                },
            ],
        ),
        (  # Case 2: events happening at the same timestamp
            [
                {
                    "__typename": "Locked",
                    "amount": "500000000000000000000",
                    "timestamp": 1000000001,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1000000001,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1000000001,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1000000001,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "__typename": "Unlocked",
                    "amount": "100000000000000000000",
                    "timestamp": 1000000001,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "__typename": "Unlocked",
                    "amount": "100000000000000000000",
                    "timestamp": 1000000001,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
            ],
            [
                {
                    "user": USER1_ADDRESS,
                    "amount": 100000000000000000000,
                    "timestamp": 1000000001,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "user": USER1_ADDRESS,
                    "amount": 100000000000000000000,
                    "timestamp": 1000000001,
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
            ],
            [
                {
                    "type": "withdrawal",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "type": "withdrawal",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "type": "unlock",
                    "amount": 400000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "type": "unlock",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "type": "unlock",
                    "amount": 100000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "type": "lock",
                    "amount": 500000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
                {
                    "type": "lock",
                    "amount": 300000000000000000000,
                    "timestamp": from_timestamp_s(1000000001).timestamp_us(),
                    "transactionHash": "0xa16081f360e3847006db660bae1c000000000000",
                },
            ],
        ),
    ],
)
@freeze_time("2023-11-01 01:48:47", tick=True, auto_tick_seconds=1)
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
                "projectAddress": a.project_address,
            }
            for a in allocations
        ],
        key=lambda x: x["amount"],
        reverse=True,
    )

    assert len(allocations) == 3

    assert toggle_patron_mode(user1.address)
    assert not toggle_patron_mode(user1.address)

    toggles = [
        {
            "type": "patron_mode_toggle",
            "timestamp": t.timestamp.timestamp_us(),
            "patronModeEnabled": t.patron_mode_enabled,
        }
        for t in get_patron_mode_toggles(user1.address, now(), 10)
    ]

    expected_history = toggles + allocations + expected_history

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
    assert [r.to_dict() for r in history] == expected_history


@pytest.fixture()
def graphql_similar_events(mocker):
    def create_events(type):
        return [
            {
                "user": USER1_ADDRESS,
                "__typename": type,
                "amount": "100",
                "timestamp": 100,
                "transactionHash": "0x1111111111111111111111111111111111111111",
            },
            {
                "user": USER1_ADDRESS,
                "__typename": type,
                "amount": "100",
                "timestamp": 100,
                "transactionHash": "0x0000000000000000000000000000000000000000",
            },
        ]

    deposits = create_events("Locked") + create_events("Unlocked")
    withdrawals = create_events("Withdrawal")

    mock_graphql(mocker, deposit_events=deposits, withdrawals_events=withdrawals)

    return deposits, withdrawals


@pytest.fixture()
def similar_allocations(tos_users, proposal_accounts):
    alice = tos_users[0]
    proposals = proposal_accounts[0:5]
    payload = create_payload(proposals, [100, 100, 100, 100, 100])
    signature = sign(alice, build_allocations_eip712_data(payload))
    MOCK_EPOCHS.get_pending_epoch.return_value = 3

    allocate(
        AllocationRequest(
            payload=payload,
            signature=signature,
            override_existing_allocations=True,
        )
    )

    allocations = get_allocations(alice.address, now(), 10)

    return allocations


@pytest.mark.parametrize("page_limit", [1, 2, 3, 5, 8, 13])
def test_history_items_are_deterministically_sorted_by_tx_hash_and_proposal_address(
    page_limit, similar_allocations, graphql_similar_events
):
    history = []
    cursor = None

    while True:
        curr_page, cursor = user_history(USER1_ADDRESS, cursor, limit=page_limit)
        history += curr_page

        if cursor is None:
            break

    # then

    assert len(history) == 5 + 2 + 2 + 2

    comparable_items = list(
        map(
            lambda x: (
                x.timestamp,
                x.type,
                x.amount,
                getattr(x, "transaction_hash", None),
                getattr(x, "project_address", None),
            ),
            history,
        )
    )

    for a, b in zip(comparable_items, comparable_items[1:]):
        assert a > b


def _allocation_items_to_tuples(allocation_items: List[AllocationItem]) -> List[tuple]:
    return [(a.project_address, a.epoch, a.amount) for a in allocation_items]


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

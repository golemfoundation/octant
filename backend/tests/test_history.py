import dataclasses

import pytest

from app.core.history import get_locks, get_unlocks
from app.extensions import graphql_client


@pytest.mark.parametrize(
    "locks, unlocks, expected_history",
    [
        (  # Case 1: unlock value in the middle
            [
                {
                    "__typename": "Locked",
                    "amount": "500000000000000000000",
                    "timestamp": 1679645896 * 10**6,
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1679645700 * 10**6,
                },
            ],
            [
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1679645800 * 10**6,
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
                    "timestamp": 1679645900 * 10**6,
                },
                {
                    "__typename": "Locked",
                    "amount": "300000000000000000000",
                    "timestamp": 1679645910 * 10**6,
                },
            ],
            [
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1679645950 * 10**6,
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
                    "timestamp": 1679645900 * 10**6,
                },
            ],
            [
                {
                    "__typename": "Unlocked",
                    "amount": "400000000000000000000",
                    "timestamp": 1679645800 * 10**6,
                },
                {
                    "__typename": "Unlocked",
                    "amount": "600000000000000000000",
                    "timestamp": 1679646000 * 10**6,
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

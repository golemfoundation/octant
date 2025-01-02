from typing import List

import pytest

from app.engine.user.effective_deposit import DepositEvent, EventType, DepositSource
from app.modules.user.events_generator.core import unify_deposit_balances
from tests.helpers.constants import TWENTY_FOUR_HOURS_PERIOD


@pytest.mark.parametrize(
    "events, expected",
    [
        # Scenario 0: Just one lock is moved from the previous epoch
        (
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=1000,
                ),
            ],
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=1000,
                ),
            ],
        ),
        # Scenario 1: Simple lock from Octant followed by a lock from Sablier
        (
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=1000,
                    source=DepositSource.OCTANT,
                ),  # Starting event
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=1,
                    amount=500,
                    deposit_before=1000,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=2,
                    amount=1000,
                    deposit_before=500,  # must be <= than the deposit_before from the first event
                    source=DepositSource.SABLIER,
                ),
            ],
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=1000,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=1,
                    amount=500,
                    deposit_before=1000,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=2,
                    amount=1000,
                    deposit_before=1500,
                    source=DepositSource.SABLIER,
                ),
            ],
        ),
        # Scenario 2: Lock from Sablier followed by a lock from Octant
        (
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=1000,
                ),  # Starting event
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=1,
                    amount=1000,
                    deposit_before=1000,
                    source=DepositSource.SABLIER,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=2,
                    amount=500,
                    deposit_before=1000,
                    source=DepositSource.OCTANT,
                ),
            ],
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=1000,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=1,
                    amount=1000,
                    deposit_before=1000,
                    source=DepositSource.SABLIER,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=2,
                    amount=500,
                    deposit_before=2000,
                    source=DepositSource.OCTANT,
                ),
            ],
        ),
        # Scenario 3: Mixed locks and unlocks from Sablier and Octant
        (
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),  # Starting event
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=1,
                    amount=500,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=2,
                    amount=1000,
                    deposit_before=500,  # must be <= than the deposit_before from the first event
                    source=DepositSource.SABLIER,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.UNLOCK,
                    timestamp=3,
                    amount=400,
                    deposit_before=1500,
                    source=DepositSource.SABLIER,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=4,
                    amount=200,
                    deposit_before=1500,
                    source=DepositSource.OCTANT,
                ),
            ],
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=1,
                    amount=500,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=2,
                    amount=1000,
                    deposit_before=1000,
                    source=DepositSource.SABLIER,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.UNLOCK,
                    timestamp=3,
                    amount=400,
                    deposit_before=2000,
                    source=DepositSource.SABLIER,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=4,
                    amount=200,
                    deposit_before=1600,
                    source=DepositSource.OCTANT,
                ),
            ],
        ),
    ],
)
def test_unify_deposit_balances(
    events: List[DepositEvent], expected: List[DepositEvent]
):
    """
    Test the unify_deposit_balances function with various event orders and types.
    """
    result = unify_deposit_balances(events, TWENTY_FOUR_HOURS_PERIOD)
    assert len(result) == len(
        expected
    ), "Number of events in result does not match expected."
    for r, e in zip(result, expected):
        assert (
            r.deposit_before == e.deposit_before
        ), f"deposit_before mismatch: {r.deposit_before} != {e.deposit_before}"
        assert (
            r.deposit_after == e.deposit_after
        ), f"deposit_after mismatch: {r.deposit_after} != {e.deposit_after}"
        assert r.amount == e.amount, f"amount mismatch: {r.amount} != {e.amount}"
        assert r.type == e.type, f"type mismatch: {r.type} != {e.type}"
        assert r.source == e.source, f"source mismatch: {r.source} != {e.source}"
        assert r.user == e.user, f"user mismatch: {r.user} != {e.user}"
        assert (
            r.timestamp == e.timestamp
        ), f"timestamp mismatch: {r.timestamp} != {e.timestamp}"


@pytest.mark.parametrize(
    "events, expected",
    [
        (
            # Scenario 1: Transparent unlock and lock
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.UNLOCK,
                    timestamp=1,
                    amount=500,
                    deposit_before=500,
                    source=DepositSource.SABLIER,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=2,
                    amount=500,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),
            ],
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),
            ],
        ),
        # Scenario 2: Amount from unlock is higher than in a lock
        (
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.UNLOCK,
                    timestamp=1,
                    amount=500,
                    deposit_before=500,
                    source=DepositSource.SABLIER,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=2,
                    amount=400,
                    deposit_before=0,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=3,
                    amount=100,
                    deposit_before=900,
                    source=DepositSource.OCTANT,
                ),
            ],
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.UNLOCK,
                    timestamp=1,
                    amount=500,
                    deposit_before=500,
                    source=DepositSource.SABLIER,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=2,
                    amount=400,
                    deposit_before=0,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=3,
                    amount=100,
                    deposit_before=400,
                    source=DepositSource.OCTANT,
                ),
            ],
        ),
        # Scenario 3: Amount from a lock is higher than in unlock
        (
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.UNLOCK,
                    timestamp=1,
                    amount=400,
                    deposit_before=500,
                    source=DepositSource.SABLIER,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=2,
                    amount=500,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=3,
                    amount=100,
                    deposit_before=1000,
                    source=DepositSource.OCTANT,
                ),
            ],
            [
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=0,
                    amount=0,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=2,
                    amount=100,
                    deposit_before=500,
                    source=DepositSource.OCTANT,
                ),
                DepositEvent(
                    user="0x123",
                    type=EventType.LOCK,
                    timestamp=3,
                    amount=100,
                    deposit_before=600,
                    source=DepositSource.OCTANT,
                ),
            ],
        ),
    ],
)
def test_unify_deposit_balances_with_grace_periods_scenarios(events, expected):
    result = unify_deposit_balances(events, TWENTY_FOUR_HOURS_PERIOD)
    assert len(result) == len(
        expected
    ), "Number of events in result does not match expected."
    for r, e in zip(result, expected):
        assert (
            r.deposit_before == e.deposit_before
        ), f"deposit_before mismatch: {r.deposit_before} != {e.deposit_before}"
        assert (
            r.deposit_after == e.deposit_after
        ), f"deposit_after mismatch: {r.deposit_after} != {e.deposit_after}"
        assert r.amount == e.amount, f"amount mismatch: {r.amount} != {e.amount}"
        assert r.type == e.type, f"type mismatch: {r.type} != {e.type}"
        assert r.source == e.source, f"source mismatch: {r.source} != {e.source}"
        assert r.user == e.user, f"user mismatch: {r.user} != {e.user}"
        assert (
            r.timestamp == e.timestamp
        ), f"timestamp mismatch: {r.timestamp} != {e.timestamp}"


@pytest.mark.parametrize(
    "expected",
    [
        [
            DepositEvent(
                user="0x123",
                type=EventType.LOCK,
                timestamp=0,
                amount=0,
                deposit_before=500,
                source=DepositSource.OCTANT,
            ),
            DepositEvent(
                user="0x123",
                type=EventType.UNLOCK,
                timestamp=1,
                amount=400,
                deposit_before=500,
                source=DepositSource.SABLIER,
            ),
            DepositEvent(
                user="0x123",
                type=EventType.LOCK,
                timestamp=2 + TWENTY_FOUR_HOURS_PERIOD,
                amount=500,
                deposit_before=100,
                source=DepositSource.OCTANT,
            ),
            DepositEvent(
                user="0x123",
                type=EventType.LOCK,
                timestamp=3 + 3,
                amount=100,
                deposit_before=600,
                source=DepositSource.OCTANT,
            ),
        ]
    ],
)
def test_unify_deposit_does_not_remove_when_out_of_the_grace_period(expected):
    result = unify_deposit_balances(expected, TWENTY_FOUR_HOURS_PERIOD)
    assert len(result) == len(expected)

    for r, e in zip(result, expected):
        assert (
            r.deposit_before == e.deposit_before
        ), f"deposit_before mismatch: {r.deposit_before} != {e.deposit_before}"
        assert (
            r.deposit_after == e.deposit_after
        ), f"deposit_after mismatch: {r.deposit_after} != {e.deposit_after}"
        assert r.amount == e.amount, f"amount mismatch: {r.amount} != {e.amount}"
        assert r.type == e.type, f"type mismatch: {r.type} != {e.type}"
        assert r.source == e.source, f"source mismatch: {r.source} != {e.source}"
        assert r.user == e.user, f"user mismatch: {r.user} != {e.user}"
        assert (
            r.timestamp == e.timestamp
        ), f"timestamp mismatch: {r.timestamp} != {e.timestamp}"

import pytest

from typing import Tuple, List, Dict

from app.core.deposits.events import EventGenerator
from app.core.deposits.weighted_deposits import WeightedDeposit
from app.core.deposits.weighted_deposits.timebased_calculator import (
    TimebasedWeightsCalculator as Calculator,
)

from tests.helpers.mock_events_generator import (
    MockEventGenerator,
    event_generator_builder,
)

EPOCH_START = 123
EPOCH_END = 323
EPOCH_DURATION = EPOCH_END - EPOCH_START


def event_generator(events):
    return event_generator_builder(EPOCH_START, EPOCH_END)(events)


def test_computes_weighted_deposit_for_none_events_for_one_user(alice):
    deposits = {alice: []}
    generator = event_generator(deposits)

    expected_result = {alice.address: []}

    assert Calculator.compute_all_users_weigted_deposits(generator) == expected_result
    assert (
        Calculator.compute_user_weighted_deposits(generator, alice.address)
        == expected_result[alice.address]
    )


def test_computes_weighted_deposit_for_one_event_for_one_user(alice):
    deposits = {alice: [(EPOCH_START, 100)]}
    generator = event_generator(deposits)

    expected_result = {alice.address: [WeightedDeposit(100, 200)]}

    assert Calculator.compute_all_users_weigted_deposits(generator) == expected_result
    assert (
        Calculator.compute_user_weighted_deposits(generator, alice.address)
        == expected_result[alice.address]
    )


def test_computes_weighted_deposit_for_two_events_for_one_user(alice):
    deposits = {alice: [(EPOCH_START, 100), (EPOCH_START + 50, 120)]}
    generator = event_generator(deposits)

    expected_result = {
        alice.address: [WeightedDeposit(100, 50), WeightedDeposit(220, 150)]
    }

    assert Calculator.compute_all_users_weigted_deposits(generator) == expected_result
    assert (
        Calculator.compute_user_weighted_deposits(generator, alice.address)
        == expected_result[alice.address]
    )


def test_weights_sum_up_to_epoch_duration(alice):
    deposits = {alice: [(EPOCH_START, 100), (EPOCH_START + 50, 120)]}
    generator = event_generator(deposits)

    assert (
        sum(
            map(
                lambda wd: wd.weight,
                Calculator.compute_user_weighted_deposits(generator, alice.address),
            )
        )
        == EPOCH_DURATION
    )


def test_computes_user_deposits_when_deposited_during_epoch(alice):
    deposits = {alice: [(EPOCH_START + 17, 100)]}
    generator = event_generator(deposits)

    expected_result = {
        alice.address: [
            WeightedDeposit(0, 17),
            WeightedDeposit(100, EPOCH_DURATION - 17),
        ]
    }

    assert Calculator.compute_all_users_weigted_deposits(generator) == expected_result
    assert (
        Calculator.compute_user_weighted_deposits(generator, alice.address)
        == expected_result[alice.address]
    )


def test_computes_user_deposits_when_unlocked_at_epoch_beginning(alice):
    deposits = {alice: [(EPOCH_START, 100), (EPOCH_START, -100)]}
    generator = event_generator(deposits)

    expected_result = {alice.address: [WeightedDeposit(0, EPOCH_DURATION)]}

    assert Calculator.compute_all_users_weigted_deposits(generator) == expected_result
    assert (
        Calculator.compute_user_weighted_deposits(generator, alice.address)
        == expected_result[alice.address]
    )


def test_computes_user_deposits_when_unlocked(alice):
    deposits = {alice: [(EPOCH_START, 100), (EPOCH_START + 150, -100)]}
    generator = event_generator(deposits)

    expected_result = {
        alice.address: [
            WeightedDeposit(100, 150),
            WeightedDeposit(0, EPOCH_DURATION - 150),
        ]
    }

    assert Calculator.compute_all_users_weigted_deposits(generator) == expected_result
    assert (
        Calculator.compute_user_weighted_deposits(generator, alice.address)
        == expected_result[alice.address]
    )


def test_computes_user_deposits_for_a_sequence_of_locks_and_unlocks(alice):
    deposits = {
        alice: [
            (EPOCH_START + 10, 100),
            (EPOCH_START + 12, -90),
            (EPOCH_START + 12, 1000),
            (EPOCH_START + 50, -1000),
            (EPOCH_START + 70, -9),
            (EPOCH_START + 120, 1000),
            (EPOCH_START + 120, 1000),
            (EPOCH_START + 160, 1500),
            (EPOCH_START + 180, -1),
        ]
    }
    generator = event_generator(deposits)

    expected_result = {
        alice.address: [
            WeightedDeposit(0, 10),
            WeightedDeposit(100, 2),
            WeightedDeposit(1010, 38),
            WeightedDeposit(10, 20),
            WeightedDeposit(1, 50),
            WeightedDeposit(2001, 40),
            WeightedDeposit(3501, 20),
            WeightedDeposit(3500, 20),
        ]
    }

    assert Calculator.compute_all_users_weigted_deposits(generator) == expected_result
    assert (
        Calculator.compute_user_weighted_deposits(generator, alice.address)
        == expected_result[alice.address]
    )

    assert (
        sum(
            map(
                lambda wd: wd.weight,
                Calculator.compute_user_weighted_deposits(generator, alice.address),
            )
        )
        == EPOCH_DURATION
    )


def test_computes_users_deposits_for_many_users(alice, bob):
    deposits = {
        alice: [(EPOCH_START, 100), (EPOCH_START + 150, -100)],
        bob: [(EPOCH_START, 321), (EPOCH_START + 172, 1100)],
    }
    generator = event_generator(deposits)

    expected_result = {
        alice.address: [
            WeightedDeposit(100, 150),
            WeightedDeposit(0, EPOCH_DURATION - 150),
        ],
        bob.address: [
            WeightedDeposit(321, 172),
            WeightedDeposit(1421, EPOCH_DURATION - 172),
        ],
    }

    assert Calculator.compute_all_users_weigted_deposits(generator) == expected_result

    assert (
        Calculator.compute_user_weighted_deposits(generator, alice.address)
        == expected_result[alice.address]
    )
    assert (
        Calculator.compute_user_weighted_deposits(generator, bob.address)
        == expected_result[bob.address]
    )


def test_scenario_i_from_xls(alice):
    deposits = {
        alice: [
            (0, 5000),
            (100, 5000),
            (300, -2000),
            (500, 1000),
            (800, -3500),
            (1000, 6000),
        ]
    }

    generator = event_generator_builder(0, 1000)(deposits)

    expected_result = {
        alice.address: [
            WeightedDeposit(5000, 100),
            WeightedDeposit(10000, 200),
            WeightedDeposit(8000, 200),
            WeightedDeposit(9000, 300),
            WeightedDeposit(5500, 200),
        ]
    }

    assert (
        Calculator.compute_user_weighted_deposits(generator, alice.address)
        == expected_result[alice.address]
    )


def test_scenario_ii_from_xls(alice):
    deposits = {
        alice: [
            (100, 1000),
            (200, 1000),
            (300, 1000),
            (400, 1000),
            (500, 1000),
            (600, 1000),
            (700, 1000),
            (800, 1000),
            (900, 1000),
            (1000, 1000),
        ]
    }

    generator = event_generator_builder(0, 1000)(deposits)

    expected_result = {
        alice.address: [
            WeightedDeposit(0, 100),
            WeightedDeposit(1000, 100),
            WeightedDeposit(2000, 100),
            WeightedDeposit(3000, 100),
            WeightedDeposit(4000, 100),
            WeightedDeposit(5000, 100),
            WeightedDeposit(6000, 100),
            WeightedDeposit(7000, 100),
            WeightedDeposit(8000, 100),
            WeightedDeposit(9000, 100),
        ]
    }

    assert (
        Calculator.compute_user_weighted_deposits(generator, alice.address)
        == expected_result[alice.address]
    )


def test_scenario_iii_from_xls(alice):
    deposits = {
        alice: [
            (100, 1000),
            (200, 1000),
            (300, 1000),
            (400, 2000),
            (500, -2000),
            (600, 1000),
            (700, 1000),
            (800, 1000),
            (900, 1000),
            (1000, 1000),
        ]
    }

    generator = event_generator_builder(0, 1000)(deposits)

    expected_result = {
        alice.address: [
            WeightedDeposit(0, 100),
            WeightedDeposit(1000, 100),
            WeightedDeposit(2000, 100),
            WeightedDeposit(3000, 100),
            WeightedDeposit(5000, 100),
            WeightedDeposit(3000, 100),
            WeightedDeposit(4000, 100),
            WeightedDeposit(5000, 100),
            WeightedDeposit(6000, 100),
            WeightedDeposit(7000, 100),
        ]
    }

    assert (
        Calculator.compute_user_weighted_deposits(generator, alice.address)
        == expected_result[alice.address]
    )

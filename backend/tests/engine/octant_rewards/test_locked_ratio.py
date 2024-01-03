from decimal import Decimal

import pytest

from app.engine.octant_rewards import DefaultLockedRatio
from app.engine.octant_rewards.locked_ratio import LockedRatioPayload


@pytest.mark.parametrize(
    "total_ed, expected",
    [
        (400_000000000_000000000, "0.0000004"),
        (
            9999_999999999_999999999,
            "0.000009999999999999999999999",
        ),
        (
            22700_000000000_099999994,
            "0.000022700000000000099999994",
        ),
        (
            77659900_000050080_003040099,
            "0.077659900000050080003040099",
        ),
        (
            111388800_044440000_000000000,
            "0.11138880004444",
        ),
        (422361100_000000000_000000000, "0.4223611"),
        (1000000000_000000000_000000000, "1"),
    ],
)
def test_default_locked_ratio(total_ed, expected):
    payload = LockedRatioPayload(total_ed)
    uut = DefaultLockedRatio()

    result = uut.calculate_locked_ratio(payload)

    assert result == Decimal(expected)

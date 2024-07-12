from decimal import Decimal

import pytest

from app.modules.uq.core import calculate_uq


@pytest.mark.parametrize(
    "gp_score, expected_output",
    [
        (1, 0.2),
        (19, 0.2),
        (20, 1.0),
        (27, 1.0),
    ],
)
def test_calculate_uq(gp_score, expected_output):
    assert calculate_uq(gp_score) == Decimal(str(expected_output))

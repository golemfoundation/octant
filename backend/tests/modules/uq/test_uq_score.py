from decimal import Decimal

import pytest

from app.modules.uq.core import calculate_uq
from tests.helpers.constants import USER1_ADDRESS, USER2_ADDRESS


@pytest.mark.parametrize(
    "gp_score, budget, in_addresses, expected_output",
    [
        (19, 0, True, 0.2),
        (19, 0, False, 0.2),
        (19, 1, False, 1.0),
        (19, 1, True, 0.2),
        (20, 0, True, 1.0),
        (20, 0, False, 1.0),
        (20, 1, True, 1.0),
        (20, 1, False, 1.0),
    ],
)
def test_calculate_uq(gp_score, budget, in_addresses, expected_output):
    addresses = [USER1_ADDRESS, USER2_ADDRESS] if in_addresses else [USER2_ADDRESS]
    assert calculate_uq(gp_score, budget, USER1_ADDRESS, addresses) == Decimal(
        str(expected_output)
    )

from decimal import Decimal

import pytest

from app.modules.uq.core import calculate_uq
from tests.helpers.constants import UQ_THRESHOLD_MAINNET


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
    assert calculate_uq(gp_score, uq_threshold=UQ_THRESHOLD_MAINNET) == Decimal(
        str(expected_output)
    )

from decimal import Decimal

import pytest

from app.modules.uq.core import calculate_uq
from tests.helpers.constants import UQ_THRESHOLD_MAINNET, LOW_UQ_SCORE, MAX_UQ_SCORE


@pytest.mark.parametrize(
    "gp_score, expected_output",
    [
        (1, LOW_UQ_SCORE),
        (14, LOW_UQ_SCORE),
        (15, MAX_UQ_SCORE),
        (27, MAX_UQ_SCORE),
    ],
)
def test_calculate_uq(gp_score, expected_output):
    assert calculate_uq(gp_score, uq_threshold=UQ_THRESHOLD_MAINNET) == Decimal(
        str(expected_output)
    )

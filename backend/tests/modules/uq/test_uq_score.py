import pytest

from app.modules.uq.core import calculate_uq

THRESHOLD = 20


@pytest.mark.parametrize(
    "has_epoch_zero_poap, gp_score, expected_output",
    [(True, 20, 1.0), (False, 20, 1.0), (True, 19, 1.0), (False, 19, 0.2)],
)
def test_calculate_uq(
    has_epoch_zero_poap,
    gp_score,
    expected_output,
):
    assert (
        calculate_uq(
            has_epoch_zero_poap,
            gp_score,
        )
        == expected_output
    )

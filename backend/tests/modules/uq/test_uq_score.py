import pytest

from app.modules.uq.core import calculate_uq, Scores

THRESHOLD = 20


@pytest.mark.parametrize(
    "has_epoch_zero_poap, passed_identity_call, num_of_donations, gp_score, expected_output",
    [
        (True, True, 2, 20, 1.0),
        (False, False, 0, 20, 1.0),
        (True, False, 0, 10, 1.0),
        (False, True, 0, 10, 1.0),
        (False, False, 2, 10, 1.0),
        (True, False, 2, 0, 1.0),
        (False, True, 2, 0, 1.0),
        (True, True, 0, 0, 1.0),
        (False, True, 0, 0, 0.2),
        (True, False, 0, 0, 0.2),
        (False, False, 0, 15, 0.2),
        (False, False, 2, 5, 0.2),
        (False, False, 1, 15, 0.2),
        (False, True, 1, 0, 0.2),
        (True, False, 1, 0, 0.2),
    ],
)
def test_calculate_uq(
    has_epoch_zero_poap,
    passed_identity_call,
    num_of_donations,
    gp_score,
    expected_output,
):
    assert (
        calculate_uq(
            has_epoch_zero_poap,
            passed_identity_call,
            num_of_donations,
            gp_score,
            Scores(),
        )
        == expected_output
    )

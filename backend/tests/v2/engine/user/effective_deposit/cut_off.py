import pytest

from app.v2.engine.user.effective_deposit import CutOff10GLM
from app.v2.engine.user.effective_deposit.cut_off import CutOffPayload
from app.v2.engine.user.effective_deposit.cut_off.cutoff_100glm import CutOff100GLM


@pytest.mark.parametrize(
    "locked,effective,expected",
    [
        (99_000000000_000000000, 50_000000000_000000000, 0),
        (150_000000000_000000000, 50_000000000_000000000, 50_000000000_000000000),
        (150_000000000_000000000, 9_000000000_000000000, 0),
    ],
)
def test_10glm_cutoff(locked, effective, expected):
    payload = CutOffPayload(locked, effective)
    uut = CutOff10GLM()

    result = uut.apply_cutoff(payload)

    assert result == expected


@pytest.mark.parametrize(
    "locked,effective,expected",
    [
        (99_000000000_000000000, 50_000000000_000000000, 0),
        (150_000000000_000000000, 99_000000000_000000000, 0),
        (150_000000000_000000000, 100_000000000_000000000, 100_000000000_000000000),
        (None, 100_000000000_000000000, 100_000000000_000000000),
    ],
)
def test_100glm_cutoff(locked, effective, expected):
    payload = CutOffPayload(locked, effective)
    uut = CutOff100GLM()

    result = uut.apply_cutoff(payload)

    assert result == expected

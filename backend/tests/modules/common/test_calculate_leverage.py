import pytest

from app.modules.common.leverage import calculate_leverage


@pytest.mark.parametrize(
    "matched, allocated, expected",
    [
        (300, 100, 3),
        (300, 0, 0),
    ],
)
def test_calculate_leverage(matched, allocated, expected):
    result = calculate_leverage(matched, allocated)
    assert result == expected

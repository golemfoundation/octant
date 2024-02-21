import pytest

from app.legacy.utils.time import days_to_sec
from app.modules.staking.proceeds.core import estimate_staking_proceeds


@pytest.mark.parametrize(
    "days, result",
    [
        (72, 680_547945205_479505920),
        (90, 850_684931506_849316864),
    ],
)
def test_estimate_epoch_eth_staking_proceeds(days, result):
    seconds = days_to_sec(days)
    assert estimate_staking_proceeds(seconds) == result

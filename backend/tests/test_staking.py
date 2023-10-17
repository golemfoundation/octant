import pytest

from app.core.staking import estimate_epoch_eth_staking_proceeds
from app.utils.time import days_to_sec


@pytest.mark.parametrize(
    "days, result",
    [
        (72, 680_547945205_479505920),
        (90, 850_684931506_849316864),
    ],
)
def test_estimate_epoch_eth_staking_proceeds(days, result):
    seconds = days_to_sec(days)
    assert estimate_epoch_eth_staking_proceeds(seconds) == result

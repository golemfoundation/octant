import pytest

from app.core.staking import estimate_epoch_eth_staking_proceeds


@pytest.mark.parametrize(
    "days, result",
    [
        (72, 680_547945205_479374848),
        (90, 850_684931506_849316864),
    ],
)
def test_estimate_epoch_eth_staking_proceeds(days, result):
    assert estimate_epoch_eth_staking_proceeds(days) == result

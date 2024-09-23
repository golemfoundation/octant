import pytest

from app.modules.octant_rewards.core import get_rewards_rate
from app.modules.staking.proceeds.core import ESTIMATED_STAKING_APR


@pytest.fixture(autouse=True)
def before(app):
    pass


@pytest.mark.parametrize("epoch_num", [1, 2, 3, 4, 5])
def test_get_epoch_rewards_rate_return_valid_value(epoch_num: int):
    actual_result = get_rewards_rate(epoch_num)
    expected_result = ESTIMATED_STAKING_APR

    assert actual_result == expected_result

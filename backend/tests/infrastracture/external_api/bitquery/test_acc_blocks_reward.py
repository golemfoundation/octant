import pytest
from app.modules.staking.proceeds.core import (
    sum_blocks_rewards,
)


@pytest.mark.parametrize(
    "blocks, result",
    [
        (
            [{"reward": 0.024473700594149782}, {"reward": 0.05342909432569912}],
            77902794919848899,
        )
    ],
)
def test_sum_blocks_rewards(blocks, result):
    actual_result = sum_blocks_rewards(blocks)
    assert actual_result == result

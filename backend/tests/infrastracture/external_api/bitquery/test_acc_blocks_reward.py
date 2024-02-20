import pytest
from app.infrastructure.external_api.bitquery.blocks_reward import (
    accumulate_blocks_reward_wei,
)


@pytest.mark.parametrize(
    "blocks, result",
    [([{"reward": 0.024473700594149782}, {"reward": 0.05342909432569912}], 77902794)],
)
def test_accumulate_blocks_reward_wei(blocks, result):
    actual_result = accumulate_blocks_reward_wei(blocks)
    assert actual_result == result

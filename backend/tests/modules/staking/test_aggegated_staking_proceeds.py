import pytest
from app.modules.staking.proceeds.service.aggregated import AggregatedStakingProceeds
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_aggregated_staking_proceeds(
    patch_etherscan_transactions_api,
    patch_bitquery_get_blocks_rewards,
):
    """
    Expected results for the test:
    MEV 66813166811131780
    WITHDRAWALS 1498810000000000
    BLOCKS REWARD 77902794919848900
    """
    context = get_context(1, with_block_range=True)

    service = AggregatedStakingProceeds()
    result = service.get_staking_proceeds(context)

    assert result == 146214771_730980680

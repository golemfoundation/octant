from decimal import Decimal

import pytest

from app.engine.octant_rewards.total_and_individual.preliminary import (
    PreliminaryTotalAndAllIndividualRewards,
)
from app.engine.octant_rewards.total_and_individual import TotalAndAllIndividualPayload
from app.engine.octant_rewards.total_and_individual.all_proceeds_with_op_cost import (
    AllProceedsWithOperationalCost,
)
from app.engine.octant_rewards.total_and_individual.double import (
    DoubleTotalAndIndividualRewards,
)


@pytest.mark.parametrize(
    "eth_proceeds,locked_ratio,exp_total,exp_all_individual",
    [
        (4_338473610_477382755, "0.0000004", 2743891_635528535, 1735_389444190),
        (
            600_000000000_000000000,
            "0.0003298799699",
            10_897558862_607717064,
            197927981_940000000,
        ),
        (10_000000000_000000000, "0.2", 4472135954999579392, 2_000000000_000000000),
        (10_000000000_000000000, "0.25", 5_000000000_000000000, 2_500000000_000000000),
        (10_000000000_000000000, "0.43", 6_557438524_302000652, 4_300000000_000000000),
        (
            1200_000000000_000000000,
            "1",
            1200_000000000_000000000,
            1200_000000000_000000000,
        ),
    ],
)
def test_preliminary_total_and_vanilla_individual_rewards(
    eth_proceeds, locked_ratio, exp_total, exp_all_individual
):
    payload = TotalAndAllIndividualPayload(eth_proceeds, Decimal(locked_ratio))
    uut = PreliminaryTotalAndAllIndividualRewards()

    total_rewards = uut.calculate_total_rewards(payload)
    vanilla_individual_rewards = uut.calculate_vanilla_individual_rewards(payload)

    assert total_rewards == exp_total
    assert vanilla_individual_rewards == exp_all_individual


@pytest.mark.parametrize(
    "eth_proceeds,locked_ratio,exp_total,exp_all_individual",
    [
        (4_338473610_477382755, "0.0000004", 3_470778888_381906204, 2195113_308422828),
        (
            600_000000000_000000000,
            "0.0003298799699",
            480_000000000_000000000,
            8_718047090_086173651,
        ),
        (10_000000000_000000000, "0.2", 8_000000000_000000000, 3_577708763_999663514),
        (10_000000000_000000000, "0.25", 8_000000000_000000000, 4_000000000_000000000),
        (10_000000000_000000000, "0.43", 8_000000000_000000000, 5_245950819_441600521),
        (
            1200_000000000_000000000,
            "1",
            960_000000000_000000000,
            960_000000000_000000000,
        ),
    ],
)
def test_all_proceeds_with_op_cost_total_and_vanilla_individual_rewards(
    eth_proceeds, locked_ratio, exp_total, exp_all_individual
):
    op_cost = int(eth_proceeds * Decimal("0.2"))
    payload = TotalAndAllIndividualPayload(eth_proceeds, Decimal(locked_ratio), op_cost)
    uut = AllProceedsWithOperationalCost()

    total_rewards = uut.calculate_total_rewards(payload)
    vanilla_individual_rewards = uut.calculate_vanilla_individual_rewards(payload)

    assert total_rewards == exp_total
    assert vanilla_individual_rewards == exp_all_individual


@pytest.mark.parametrize(
    "eth_proceeds,locked_ratio,exp_total,exp_all_individual",
    [
        (4_338473610_477382755, "0.0000004", 5487783_271057070, 3470_778888380),
        (
            600_000000000_000000000,
            "0.0003298799699",
            21_795117725_215434128,
            395855963_880000000,
        ),
        (10_000000000_000000000, "0.2", 8_944271909_999158784, 4_000000000_000000000),
        (4_338473610_477382755, "0.25", 4_338473610_477382755, 2_169236805_238691377),
        (10_000000000_000000000, "0.25", 10_000000000_000000000, 5_000000000_000000000),
        (4_338473610_477382755, "0.43", 4_338473610_477382755, 2_169236805_238691377),
        (10_000000000_000000000, "0.43", 10_000000000_000000000, 5_000000000_000000000),
        (
            1200_000000000_000000000,
            "1",
            1200_000000000_000000000,
            600_000000000_000000000,
        ),
    ],
)
def test_double_total_and_vanilla_individual_rewards(
    eth_proceeds, locked_ratio, exp_total, exp_all_individual
):
    payload = TotalAndAllIndividualPayload(eth_proceeds, Decimal(locked_ratio))
    uut = DoubleTotalAndIndividualRewards()

    total_rewards = uut.calculate_total_rewards(payload)
    vanilla_individual_rewards = uut.calculate_vanilla_individual_rewards(payload)

    assert total_rewards == exp_total
    assert vanilla_individual_rewards == exp_all_individual

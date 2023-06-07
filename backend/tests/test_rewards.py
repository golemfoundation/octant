import pytest

from app import database
from app.controllers.rewards import get_user_budget
from app.core.rewards import calculate_total_rewards, calculate_all_individual_rewards

from decimal import Decimal


@pytest.mark.parametrize(
    "eth_proceeds,staked_ratio,expected",
    [
        (4_338473610_477382755, Decimal("0.0000004"), 2743891_635528535),
        (600_000000000_000000000, Decimal("0.0003298799699"), 10_897558862_607717064),
        (10_000000000_000000000, Decimal("0.43"), 6_557438524_302000652),
        (1200_000000000_000000000, Decimal("1"), 1200_000000000_000000000),
    ],
)
def test_calculate_total_rewards(eth_proceeds, staked_ratio, expected):
    result = calculate_total_rewards(eth_proceeds, staked_ratio)
    assert result == expected


@pytest.mark.parametrize(
    "eth_proceeds,staked_ratio,expected",
    [
        (4_338473610_477382755, Decimal("0.0000004"), 1735_389444190),
        (600_000000000_000000000, Decimal("0.0003298799699"), 197927981_940000000),
        (10_000000000_000000000, Decimal("0.43"), 4_300000000_000000000),
        (1200_000000000_000000000, Decimal("1"), 1200_000000000_000000000),
    ],
)
def test_calculate_all_individual_rewards(eth_proceeds, staked_ratio, expected):
    result = calculate_all_individual_rewards(eth_proceeds, staked_ratio)
    assert result == expected


def test_get_user_budget(app):
    user_address = "0xabcdef7890123456789012345678901234567893"
    glm_supply = 1000000000_000000000_000000000
    eth_proceeds = 402_410958904_110000000
    total_ed = 22700_000000000_099999994
    user_ed = 1500_000055377_000000000
    staked_ratio = Decimal("0.000022700000000000099999994")
    total_rewards = 1_917267577_180363384
    all_individual_rewards = 9134728_767123337
    expected_result = 603616_460640476

    database.epoch_snapshot.add_snapshot(
        1,
        glm_supply,
        eth_proceeds,
        total_ed,
        staked_ratio,
        total_rewards,
        all_individual_rewards,
    )
    user = database.user.add_user(user_address)
    database.deposits.add_deposit(1, user, user_ed, user_ed)

    result = get_user_budget(user_address, 1)

    assert result == expected_result

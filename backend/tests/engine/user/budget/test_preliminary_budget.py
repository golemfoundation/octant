import pytest

from app.engine.user.budget.preliminary import PreliminaryUserBudget
from app.engine.user.budget import UserBudgetPayload
from tests.helpers.constants import USER1_ED, TOTAL_ED, ALL_INDIVIDUAL_REWARDS


@pytest.fixture
def calculator():
    return PreliminaryUserBudget()


@pytest.mark.parametrize(
    "user_effective_deposit, total_effective_deposit,all_individual_rewards,ppf,expected",
    [
        (1, 100, 90, 350, 900000000_000000000),
        (1, 100, 150, 350, 1_500000000_000000000),
        (1, 100, 175, 350, 1_750000000_000000000),
        (1, 100, 180, 350, 1_800000000_000000000),
        (1, 100, 230, 350, 2_300000000_000000000),
    ],
)
def test_user_budget_with_ppf(
    calculator,
    user_effective_deposit,
    total_effective_deposit,
    all_individual_rewards,
    ppf,
    expected,
):
    payload = UserBudgetPayload(
        user_effective_deposit * 10**18,
        total_effective_deposit * 10**18,
        all_individual_rewards * 10**18,
        ppf * 10**18,
    )
    assert calculator.calculate_budget(payload) == expected


def test_preliminary_user_budget(calculator):
    payload = UserBudgetPayload(USER1_ED, TOTAL_ED, ALL_INDIVIDUAL_REWARDS)

    result = calculator.calculate_budget(payload)

    assert result == 1526868_989237987


def test_preliminary_user_budget_total_effective_equals_0(calculator):
    payload = UserBudgetPayload(USER1_ED, 0, ALL_INDIVIDUAL_REWARDS)
    result = calculator.calculate_budget(payload)

    assert result == 0


def test_preliminary_user_budget_total_effective_is_none(calculator):
    payload = UserBudgetPayload(
        user_effective_deposit=USER1_ED, all_individual_rewards=ALL_INDIVIDUAL_REWARDS
    )
    result = calculator.calculate_budget(payload)

    assert result == 0

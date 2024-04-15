from app.engine.user.budget.preliminary import PreliminaryUserBudget
from app.engine.user.budget import UserBudgetPayload
from tests.helpers.constants import USER1_ED, TOTAL_ED, ALL_INDIVIDUAL_REWARDS


def test_preliminary_user_budget():
    payload = UserBudgetPayload(USER1_ED, TOTAL_ED, ALL_INDIVIDUAL_REWARDS)
    uut = PreliminaryUserBudget()

    result = uut.calculate_budget(payload)

    assert result == 1526868_989237987


def test_preliminary_user_budget_total_effective_equals_0():
    payload = UserBudgetPayload(USER1_ED, 0, ALL_INDIVIDUAL_REWARDS)
    uut = PreliminaryUserBudget()

    result = uut.calculate_budget(payload)

    assert result == 0


def test_preliminary_user_budget_total_effective_is_none():
    payload = UserBudgetPayload(
        user_effective_deposit=USER1_ED, all_individual_rewards=ALL_INDIVIDUAL_REWARDS
    )
    uut = PreliminaryUserBudget()

    result = uut.calculate_budget(payload)

    assert result == 0

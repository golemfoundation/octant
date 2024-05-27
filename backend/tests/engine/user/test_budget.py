from app.engine.user.budget.preliminary import PreliminaryUserBudget
from app.engine.user.budget.with_ppf import UserBudgetWithPPF
from app.engine.user.budget import UserBudgetPayload
from tests.helpers.constants import USER1_ED, TOTAL_ED, VANILLA_INDIVIDUAL_REWARDS, PPF


def test_preliminary_user_budget():
    payload = UserBudgetPayload(USER1_ED, TOTAL_ED, VANILLA_INDIVIDUAL_REWARDS)
    uut = PreliminaryUserBudget()

    result = uut.calculate_budget(payload)

    assert result == 1526868_989237987


def test_preliminary_user_budget_total_effective_equals_0():
    payload = UserBudgetPayload(USER1_ED, 0, VANILLA_INDIVIDUAL_REWARDS)
    uut = PreliminaryUserBudget()

    result = uut.calculate_budget(payload)

    assert result == 0


def test_preliminary_user_budget_total_effective_is_none():
    payload = UserBudgetPayload(
        user_effective_deposit=USER1_ED,
        vanilla_individual_rewards=VANILLA_INDIVIDUAL_REWARDS,
    )
    uut = PreliminaryUserBudget()

    result = uut.calculate_budget(payload)

    assert result == 0


def test_user_budget_with_ppf():
    payload = UserBudgetPayload(
        user_effective_deposit=USER1_ED,
        vanilla_individual_rewards=VANILLA_INDIVIDUAL_REWARDS,
        ppf=PPF,
        total_effective_deposit=TOTAL_ED,
    )
    uut = UserBudgetWithPPF()

    result = uut.calculate_budget(payload)

    assert result == 1819523568520052


def test_user_budget_with_ppf_as_null():
    payload = UserBudgetPayload(
        user_effective_deposit=USER1_ED,
        vanilla_individual_rewards=VANILLA_INDIVIDUAL_REWARDS,
        ppf=0,
        total_effective_deposit=TOTAL_ED,
    )
    uut = UserBudgetWithPPF()

    result = uut.calculate_budget(payload)

    assert result == 1526868989237987

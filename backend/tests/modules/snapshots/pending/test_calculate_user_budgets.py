from app.engine.user.budget.preliminary import PreliminaryUserBudget
from app.engine.user.effective_deposit import UserDeposit
from app.modules.snapshots.pending import UserBudgetInfo
from app.modules.snapshots.pending.core import calculate_user_budgets
from tests.helpers.constants import USER1_ADDRESS, USER1_ED, USER2_ED, USER2_ADDRESS
from tests.helpers.octant_rewards import octant_rewards


def test_calculate_user_budgets():
    rewards = octant_rewards()
    deposits = [
        UserDeposit(USER1_ADDRESS, USER1_ED, USER1_ED),
        UserDeposit(USER2_ADDRESS, USER2_ED, USER2_ED),
    ]
    result = calculate_user_budgets(PreliminaryUserBudget(), rewards, deposits)

    assert result == [
        UserBudgetInfo(USER1_ADDRESS, 1526868_989237987),
        UserBudgetInfo(USER2_ADDRESS, 5598519_420519815),
    ]


def test_returns_only_positive_budgets():
    rewards = octant_rewards(total_effective_deposit=0)
    deposits = [
        UserDeposit(USER1_ADDRESS, USER1_ED, USER1_ED),
        UserDeposit(USER2_ADDRESS, USER2_ED, USER2_ED),
    ]
    result = calculate_user_budgets(PreliminaryUserBudget(), rewards, deposits)

    assert result == []

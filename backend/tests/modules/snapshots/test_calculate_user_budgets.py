from app.engine.user import DefaultUserBudget
from app.engine.user.effective_deposit import UserDeposit
from app.modules.snapshots.pending.core import calculate_user_budgets
from tests.helpers.constants import USER1_ADDRESS, USER1_ED, USER2_ED, USER2_ADDRESS
from tests.helpers.context import get_context


def test_calculate_user_budgets():
    context = get_context()
    deposits = [
        UserDeposit(USER1_ADDRESS, USER1_ED, USER1_ED),
        UserDeposit(USER2_ADDRESS, USER2_ED, USER2_ED),
    ]

    result = calculate_user_budgets(
        DefaultUserBudget(), context.octant_rewards, deposits
    )

    assert result == [
        (USER1_ADDRESS, 1526868_989237987),
        (USER2_ADDRESS, 5598519_420519815),
    ]


def test_returns_only_positive_budgets():
    context = get_context(total_effective_deposit=0)
    deposits = [
        UserDeposit(USER1_ADDRESS, USER1_ED, USER1_ED),
        UserDeposit(USER2_ADDRESS, USER2_ED, USER2_ED),
    ]

    result = calculate_user_budgets(
        DefaultUserBudget(), context.octant_rewards, deposits
    )

    assert result == []

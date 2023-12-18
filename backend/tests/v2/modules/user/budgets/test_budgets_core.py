from app.v2.engine.user import DefaultUserBudget
from app.v2.engine.user.effective_deposit import UserDeposit
from app.v2.modules.user.budgets.core import calculate_budgets
from tests.conftest import (
    TOTAL_ED,
    ALL_INDIVIDUAL_REWARDS,
    USER1_ADDRESS,
    USER2_ADDRESS,
)


def test_calculate_budgets():
    deposits = [
        UserDeposit(USER1_ADDRESS, 270_000000000_000000000, 300_000000000_000000000),
        UserDeposit(USER2_ADDRESS, 2790_000000000_000000000, 3100_000000000_000000000),
    ]
    result = calculate_budgets(
        DefaultUserBudget(), deposits, TOTAL_ED, ALL_INDIVIDUAL_REWARDS
    )

    assert len(result) == 2
    assert result[0][0] == USER1_ADDRESS
    assert result[0][1] == 274836_407916427
    assert result[1][0] == USER2_ADDRESS
    assert result[1][1] == 2839976_215136415

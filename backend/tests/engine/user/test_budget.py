from app.engine.user import DefaultUserBudget
from app.engine.user.budget import UserBudgetPayload
from tests.conftest import USER1_ED, TOTAL_ED, ALL_INDIVIDUAL_REWARDS


def test_default_user_budget():
    payload = UserBudgetPayload(USER1_ED, TOTAL_ED, ALL_INDIVIDUAL_REWARDS)
    uut = DefaultUserBudget()

    result = uut.calculate_budget(payload)

    assert result == 1526868_989237987

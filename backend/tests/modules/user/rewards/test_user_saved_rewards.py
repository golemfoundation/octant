import pytest

from app.modules.user.rewards.service.saved import SavedUserRewards
from tests.helpers.constants import USER3_BUDGET
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_get_unused_rewards(
    carol, mock_user_budgets, mock_user_allocations, mock_patron_mode
):
    context = get_context(1)

    service = SavedUserRewards(
        user_budgets=mock_user_budgets,
        allocations=mock_user_allocations,
        patrons_mode=mock_patron_mode,
    )

    result = service.get_unused_rewards(context)

    assert result == {carol.address: USER3_BUDGET}

import pytest

from app.extensions import db
from app.infrastructure import database
from app.modules.user.budgets.service.saved import SavedUserBudgets
from tests.helpers.constants import USER1_BUDGET, USER2_BUDGET, USER3_BUDGET
from tests.helpers.context import get_context
from app.modules.snapshots.pending import UserBudgetInfo


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_get_all_budgets(alice, bob, carol):
    budgets_epoch_1 = [
        UserBudgetInfo(alice.address, USER1_BUDGET),
        UserBudgetInfo(bob.address, USER2_BUDGET),
    ]
    budgets_epoch_2 = [
        UserBudgetInfo(carol.address, USER3_BUDGET),
    ]
    database.budgets.save_budgets(1, budgets_epoch_1)
    database.budgets.save_budgets(2, budgets_epoch_2)
    db.session.commit()

    context_epoch_1 = get_context(1)
    context_epoch_2 = get_context(2)

    service = SavedUserBudgets()

    result_epoch_1 = service.get_all_budgets(context_epoch_1)
    result_epoch_2 = service.get_all_budgets(context_epoch_2)

    assert result_epoch_1 == {
        alice.address: USER1_BUDGET,
        bob.address: USER2_BUDGET,
    }
    assert result_epoch_2 == {carol.address: USER3_BUDGET}


def test_get_budget(alice):
    budgets = [
        UserBudgetInfo(alice.address, USER1_BUDGET),
    ]
    database.budgets.save_budgets(1, budgets)
    db.session.commit()

    context = get_context(1)

    service = SavedUserBudgets()

    result = service.get_budget(context, alice.address)

    assert result == USER1_BUDGET

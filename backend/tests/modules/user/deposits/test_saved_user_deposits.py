import pytest

from app.exceptions import EffectiveDepositNotFoundException
from app.extensions import db
from app.infrastructure import database
from app.modules.user.deposits.service.saved import SavedUserDeposits
from tests.helpers.constants import USER1_ADDRESS, USER1_ED
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_get_user_effective_deposit_in_epoch():
    user = database.user.get_or_add_user(USER1_ADDRESS)
    database.deposits.add(2, user, USER1_ED, USER1_ED)
    db.session.commit()
    context = get_context(2)

    service = SavedUserDeposits()

    result = service.get_user_effective_deposit(context, USER1_ADDRESS)

    assert result == 1500_000055377_000000000


def test_get_user_effective_deposit_in_epoch_throws_error_when_deposit_not_found():
    user = database.user.get_or_add_user(USER1_ADDRESS)
    database.deposits.add(2, user, USER1_ED, USER1_ED)
    db.session.commit()
    context = get_context(3)

    service = SavedUserDeposits()

    with pytest.raises(EffectiveDepositNotFoundException):
        service.get_user_effective_deposit(context, USER1_ADDRESS)

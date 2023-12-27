import pytest

from app import database
from app.exceptions import EffectiveDepositNotFoundException
from app.extensions import db
from app.v2.context.builder import ContextBuilder
from app.v2.modules.user.deposits.service.service import UserDepositsReader
from tests.conftest import USER1_ADDRESS, USER1_ED


@pytest.fixture(autouse=True)
def before(app, patch_epochs, mock_epoch_details):
    pass


def test_get_user_effective_deposit_in_epoch():
    user = database.user.get_or_add_user(USER1_ADDRESS)
    database.deposits.add(2, user, USER1_ED, USER1_ED)
    db.session.commit()
    context = ContextBuilder().with_users([USER1_ADDRESS]).build()
    service = UserDepositsReader()

    result = service.get_user_effective_deposit(context, USER1_ADDRESS, 2)

    assert result == 1500_000055377_000000000


def test_get_user_effective_deposit_in_epoch_throws_error_when_deposit_not_found():
    user = database.user.get_or_add_user(USER1_ADDRESS)
    database.deposits.add(2, user, USER1_ED, USER1_ED)
    db.session.commit()
    context = ContextBuilder().with_users([USER1_ADDRESS]).build()
    service = UserDepositsReader()

    with pytest.raises(EffectiveDepositNotFoundException):
        service.get_user_effective_deposit(context, USER1_ADDRESS, 3)

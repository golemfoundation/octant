import pytest

from app import db
from app.infrastructure import database
from app.modules.user.participation.epoch_0.service.whitelist import WhitelistEpoch0
from tests.helpers.constants import USER1_ADDRESS, USER2_ADDRESS


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_epoch0_user_whitelisted(context):
    database.claims.add_claim(USER1_ADDRESS)
    db.session.commit()

    service = WhitelistEpoch0()

    assert service.exists(context, USER1_ADDRESS)


def test_epoch0_user_not_whitelisted(context):
    database.claims.add_claim(USER1_ADDRESS)
    db.session.commit()

    service = WhitelistEpoch0()

    assert not service.exists(context, USER2_ADDRESS)

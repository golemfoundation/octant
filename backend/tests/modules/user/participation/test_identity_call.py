import pytest

from app import db
from app.infrastructure import database
from app.modules.user.participation.identity_call.service.whitelist import (
    WhitelistIdentityCall,
)
from tests.helpers.constants import USER1_ADDRESS, USER2_ADDRESS


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_identity_call_user_whitelisted(context):
    database.identity_calls.add_to_whitelist(USER1_ADDRESS)
    db.session.commit()

    service = WhitelistIdentityCall()

    assert service.exists(context, USER1_ADDRESS)


def test_identity_call_user_not_whitelisted(context):
    database.identity_calls.add_to_whitelist(USER1_ADDRESS)
    db.session.commit()

    service = WhitelistIdentityCall()

    assert not service.exists(context, USER2_ADDRESS)

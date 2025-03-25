import pytest

from app.extensions import w3
from app.infrastructure import database
from tests.conftest import UserAccount
from tests.api_e2e.conftest import FastAPIClient
from app.extensions import db


@pytest.mark.api
def test_antisybil(fclient: FastAPIClient, ua_alice: UserAccount):
    database.user.add_user(ua_alice.address)
    db.session.commit()

    # flow for an address known to GP
    _, code = fclient.get_antisybil_score(ua_alice.address)
    assert code == 404  # score for this user is not cached

    _, code = fclient.refresh_antisybil_score(ua_alice.address)
    assert code == 204

    score, code = fclient.get_antisybil_score(ua_alice.address)
    assert code == 200  # score available
    assert score["status"] == "Known"
    assert float(score["score"]) > 0
    assert int(score["expiresAt"]) > 0

    # flow for a brand new address, which couldn't be scored by GP yet
    ua_jane = UserAccount(w3.eth.account.create(), fclient)
    database.user.add_user(ua_jane.address)
    db.session.commit()

    _, code = fclient.get_antisybil_score(ua_jane.address)
    assert code == 404  # score for this user is not cached

    _, code = fclient.refresh_antisybil_score(ua_jane.address)
    assert code == 204

    score, code = fclient.get_antisybil_score(ua_jane.address)
    assert code == 200  # score available
    assert score["status"] == "Known"
    assert float(score["score"]) == 0.0
    assert int(score["expiresAt"]) > 0

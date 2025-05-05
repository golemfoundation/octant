import pytest

from app.extensions import w3
from tests.conftest import add_user_sync
from tests.api_e2e.conftest import FastAPIClient, FastUserAccount
from sqlalchemy.orm import Session


@pytest.mark.api
def test_antisybil(
    fclient: FastAPIClient, ua_alice: FastUserAccount, sync_session: Session
):
    add_user_sync(sync_session, ua_alice.address)
    sync_session.commit()

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
    ua_jane = FastUserAccount(w3.eth.account.create(), fclient)
    add_user_sync(sync_session, ua_jane.address)
    sync_session.commit()

    _, code = fclient.get_antisybil_score(ua_jane.address)
    assert code == 404  # score for this user is not cached

    _, code = fclient.refresh_antisybil_score(ua_jane.address)
    assert code == 204

    score, code = fclient.get_antisybil_score(ua_jane.address)
    assert code == 200  # score available
    assert score["status"] == "Known"
    assert float(score["score"]) == 0.0
    assert int(score["expiresAt"]) > 0

import pytest

from app.extensions import w3
from app.infrastructure import database
from tests.conftest import Client, UserAccount


@pytest.mark.api
def test_antisybil(client: Client, ua_alice: UserAccount):
    database.user.add_user(ua_alice.address)
    # flow for an address known to GP
    _, code = client.get_antisybil_score(ua_alice.address)
    assert code == 404  # score for this user is not cached

    _, code = client.refresh_antisybil_score(ua_alice.address)
    assert code == 204

    score, code = client.get_antisybil_score(ua_alice.address)
    assert code == 200  # score available
    assert score["status"] == "Known"
    assert float(score["score"]) > 0
    assert int(score["expires_at"]) > 0

    # flow for a brand new address, which couldn't be scored by GP yet
    ua_jane = UserAccount(w3.eth.account.create(), client)
    database.user.add_user(ua_jane.address)
    _, code = client.get_antisybil_score(ua_jane.address)
    assert code == 404  # score for this user is not cached

    _, code = client.refresh_antisybil_score(ua_jane.address)
    assert code == 204

    score, code = client.get_antisybil_score(ua_jane.address)
    assert code == 200  # score available
    assert score["status"] == "Known"
    assert float(score["score"]) == 0.0
    assert int(score["expires_at"]) > 0

import pytest

from app.extensions import w3
from app.infrastructure import database
from tests.conftest import Client, UserAccount


@pytest.mark.api
def test_holonym(client: Client):
    # check status for a known address with SBT before caching
    address_with_sbt = "0x76273DCC41356e5f0c49bB68e525175DC7e83417"
    database.user.add_user(address_with_sbt)
    _, code = client.get_antisybil_score(address_with_sbt)
    assert code == 404  # score for this user is not cached

    _, code = client.refresh_antisybil_score(address_with_sbt)
    assert code == 204

    # check after caching
    score, code = client.get_antisybil_score(address_with_sbt)
    assert code == 200  # score available
    assert score["holonym"] == "True"

    # check re-fetch
    _, code = client.refresh_antisybil_score(address_with_sbt)
    assert code == 204

    # check for address that can't have an SBT (known non-wallet smart-contract)
    smart_contract_address = "0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429"
    database.user.add_user(smart_contract_address)
    _, code = client.get_antisybil_score(smart_contract_address)
    assert code == 404

    _, code = client.refresh_antisybil_score(smart_contract_address)
    assert code == 204

    score, code = client.get_antisybil_score(smart_contract_address)
    assert code == 200  # score available
    assert score["holonym"] == "False"


@pytest.mark.api
def test_passport(client: Client, ua_alice: UserAccount):
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

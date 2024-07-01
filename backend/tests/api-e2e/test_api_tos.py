import pytest

from tests.conftest import Client, UserAccount
from tests.helpers.signature import build_user_signature


@pytest.mark.api
def test_tos_basics(
    client: Client,
    ua_alice: UserAccount,
    setup_funds,
):
    # Check Alice's TOS status before accepting it
    alice_tos_status, status_code = client.get_user_tos_status(ua_alice.address)
    assert not alice_tos_status["accepted"], "Alice TOS is already accepted"
    assert status_code == 200

    # Alice accepts TOS
    signature = build_user_signature(ua_alice._account)
    res, status_code = client.accept_tos(ua_alice.address, signature.hex())
    assert res["accepted"], "Alice TOS is not accepted"
    assert status_code == 201

    # Check Alice's TOS status after accepting it
    alice_tos_status, status_code = client.get_user_tos_status(ua_alice.address)
    assert alice_tos_status["accepted"], "Alice TOS is not accepted"
    assert status_code == 200

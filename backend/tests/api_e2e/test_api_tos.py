import pytest

from tests.helpers.signature import build_user_signature
from tests.api_e2e.conftest import FastAPIClient, FastUserAccount


@pytest.mark.api
def test_tos_basics(
    fclient: FastAPIClient,
    ua_alice: FastUserAccount,
):
    # Check Alice's TOS status before accepting it
    alice_tos_status, status_code = fclient.get_user_tos_status(ua_alice.address)
    assert not alice_tos_status["accepted"], "Alice TOS is already accepted"
    assert status_code == 200

    # Alice accepts TOS
    signature = build_user_signature(ua_alice._account)
    res, status_code = fclient.accept_tos(ua_alice.address, signature.hex())
    assert res["accepted"], "Alice TOS is not accepted"
    assert status_code == 201

    # Check Alice's TOS status after accepting it
    alice_tos_status, status_code = fclient.get_user_tos_status(ua_alice.address)
    assert alice_tos_status["accepted"], "Alice TOS is not accepted"
    assert status_code == 200

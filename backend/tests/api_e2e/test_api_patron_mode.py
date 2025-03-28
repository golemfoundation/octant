import pytest

from flask import current_app as app
from tests.helpers.constants import STARTING_EPOCH
from tests.conftest import UserAccount
from tests.helpers.signature import build_user_signature_patron
from tests.api_e2e.conftest import FastAPIClient


@pytest.mark.api
def test_patron_mode_basics(
    fclient: FastAPIClient,
    deployer: UserAccount,
    ua_alice: UserAccount,
    setup_funds,
):
    # lock GLM for one account
    ua_alice.lock(10000)

    # Check Alice's patron mode
    alice_patron, status_code = fclient.get_patron_mode_status(ua_alice.address)
    assert not alice_patron["status"], "Patron mode is enabled"
    assert status_code == 200

    # Toggle patron mode on
    signature = build_user_signature_patron(ua_alice._account, True)
    res, status_code = fclient.patch_patron(ua_alice.address, signature.hex())
    assert res["status"], "Patron mode is disabled"
    assert status_code == 200

    # Check patron list after alice patron mode on
    patrons, status_code = fclient.get_epoch_patrons(STARTING_EPOCH)
    assert len(patrons["patrons"]) == 1, "There should be one patron"
    for patron in patrons["patrons"]:
        assert patron == ua_alice.address, "Patron user address is wrong"
    assert status_code == 200

    # Check Alice's patron mode
    alice_patron, status_code = fclient.get_patron_mode_status(ua_alice.address)
    assert alice_patron["status"], "Patron mode is disabled"
    assert status_code == 200

    # Toggle patron mode off
    signature = build_user_signature_patron(ua_alice._account, False)
    res, status_code = fclient.patch_patron(ua_alice.address, signature.hex())
    assert not res["status"], "Patron mode is enabled"
    assert status_code == 200

    # Check patron list after alice patron mode off
    patrons, status_code = fclient.get_epoch_patrons(STARTING_EPOCH)
    assert len(patrons["patrons"]) == 0, "There are records in patron list"
    assert status_code == 200

    # Check Alice's patron mode
    alice_patron, status_code = fclient.get_patron_mode_status(ua_alice.address)
    assert not alice_patron["status"], "Patron mode is enabled"
    assert status_code == 200

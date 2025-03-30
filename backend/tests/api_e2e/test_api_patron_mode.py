import pytest

from sqlalchemy.orm import Session
from flask import current_app as app
from tests.helpers.constants import STARTING_EPOCH
from tests.conftest import UserAccount, add_user_sync
from tests.helpers.signature import build_user_signature_patron
from tests.api_e2e.conftest import FastAPIClient


@pytest.mark.api
def test_patron_mode_basics(
    fclient: FastAPIClient,
    deployer: UserAccount,
    ua_alice: UserAccount,
    setup_funds,
    sync_session: Session,
):
    # create user in db
    add_user_sync(sync_session, ua_alice.address)
    sync_session.commit()

    # wait for indexer to catch up
    fclient.wait_for_sync(STARTING_EPOCH)

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
    assert (
        len(patrons["patrons"]) == 0
    ), "We have patron, but has no budget so not included"
    assert status_code == 200

    # Check Alice's patron mode
    alice_patron, status_code = fclient.get_patron_mode_status(ua_alice.address)
    assert alice_patron["status"], "Patron mode should be enabled"
    assert status_code == 200

    # Toggle patron mode off
    signature = build_user_signature_patron(ua_alice._account, False)
    res, status_code = fclient.patch_patron(ua_alice.address, signature.hex())
    assert not res["status"], "Patron mode should be disabled after this operation"
    assert status_code == 200

    # Check patron list after alice patron mode off
    patrons, status_code = fclient.get_epoch_patrons(STARTING_EPOCH)
    assert len(patrons["patrons"]) == 0, "There should be no patrons (still)"
    assert status_code == 200

    # Check Alice's patron mode
    alice_patron, status_code = fclient.get_patron_mode_status(ua_alice.address)
    assert not alice_patron["status"], "Alice should remain non-patron"
    assert status_code == 200

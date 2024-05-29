import pytest

from flask import current_app as app
from tests.helpers.constants import STARTING_EPOCH
from tests.conftest import Client, UserAccount
from tests.helpers.signature import build_user_signature_patron


@pytest.mark.api
def test_withdrawals(
    client: Client,
    deployer: UserAccount,
    ua_alice: UserAccount,
    ua_bob: UserAccount,
    ua_carol: UserAccount,
    setup_funds,
):
    # lock GLM for one account
    ua_alice.lock(10000)

    # Check Alice's patron mode
    alice_patron, _ = client.get_patron_mode_status(ua_alice.address)
    print("Alice PATRON false: ", alice_patron)

    # forward time to the beginning of the epoch 2
    client.move_to_next_epoch(STARTING_EPOCH + 1)

    # wait for indexer to catch up
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 1)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a snapshot
    res = client.pending_snapshot()
    assert res["epoch"] > 0

    # Toggle patron mode
    # SIGNATURE:
    signature = build_user_signature_patron(ua_alice._account)
    print("SIGNATURE: ", signature)
    res, _ = client.patch_patron(ua_alice.address, signature.hex())
    print("Patron toggled: ", res)

    # Check patron list after alice patron
    patrons, _ = client.get_epoch_patrons(STARTING_EPOCH)
    print("Patrons in epoch 1: ", patrons)

    # Check Alice's patron mode
    alice_patron, _ = client.get_patron_mode_status(ua_alice.address)
    print("ALICE PATRON true ", alice_patron)

    # TODO replace with helper to wait until end of voting
    client.move_to_next_epoch(STARTING_EPOCH + 2)
    epoch_no = client.wait_for_sync(STARTING_EPOCH + 2)
    app.logger.debug(f"indexed epoch: {epoch_no}")

    # make a finalized snapshot
    # res = client.pending_snapshot()
    res = client.finalized_snapshot()
    assert res["epoch"] == STARTING_EPOCH

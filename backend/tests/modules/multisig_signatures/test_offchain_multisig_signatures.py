import pytest

from app.extensions import db
from app.infrastructure import database
from app.infrastructure.database.multisig_signature import SigStatus
from app.modules.multisig_signatures.dto import Signature, SignatureOpType
from app.modules.multisig_signatures.service.offchain import OffchainMultisigSignatures


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_get_last_pending_signature_returns_expected_signature_when_signature_exists(
    context, alice, bob
):
    # Given
    database.multisig_signature.save_signature(
        alice.address,
        SignatureOpType.ALLOCATION,
        "last pending msg",
        "last pending hash",
    )
    database.multisig_signature.save_signature(
        alice.address,
        SignatureOpType.ALLOCATION,
        "test_message",
        "test_hash",
        status=SigStatus.APPROVED,
    )
    database.multisig_signature.save_signature(
        alice.address, SignatureOpType.TOS, "test_message", "test_hash"
    )
    database.multisig_signature.save_signature(
        bob.address, SignatureOpType.ALLOCATION, "test_message", "test_hash"
    )
    db.session.commit()

    service = OffchainMultisigSignatures()

    # When
    result = service.get_last_pending_signature(
        context, alice.address, SignatureOpType.ALLOCATION
    )

    # Then
    assert isinstance(result, Signature)
    assert result.message == "last pending msg"
    assert result.hash == "last pending hash"


def test_get_last_pending_signature_returns_none_when_no_signature_exists(
    context, alice
):
    # Given
    service = OffchainMultisigSignatures()

    # When
    result = service.get_last_pending_signature(
        context, alice.address, SignatureOpType.ALLOCATION
    )

    # Then
    assert result is None

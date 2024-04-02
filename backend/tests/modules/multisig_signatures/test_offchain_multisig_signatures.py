import pytest

from app.exceptions import InvalidMultisigSignatureRequest
from app.extensions import db
from app.infrastructure import database
from app.infrastructure.database.multisig_signature import SigStatus
from app.modules.common.verifier import Verifier
from app.modules.dto import SignatureOpType
from app.modules.multisig_signatures.dto import Signature
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
        "0.0.0.0",
    )
    database.multisig_signature.save_signature(
        alice.address,
        SignatureOpType.ALLOCATION,
        "test_message",
        "test_hash",
        "0.0.0.0",
        status=SigStatus.APPROVED,
    )
    database.multisig_signature.save_signature(
        alice.address, SignatureOpType.TOS, "test_message", "test_hash", "0.0.0.0"
    )
    database.multisig_signature.save_signature(
        bob.address, SignatureOpType.ALLOCATION, "test_message", "test_hash", "0.0.0.0"
    )
    db.session.commit()

    service = OffchainMultisigSignatures(verifiers={})

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
    service = OffchainMultisigSignatures(verifiers={})

    # When
    result = service.get_last_pending_signature(
        context, alice.address, SignatureOpType.ALLOCATION
    )

    # Then
    assert result is None


def test_save_signature_when_verified_successfully(context, alice, mock_verifier):
    # Given
    service = OffchainMultisigSignatures(verifiers={SignatureOpType.TOS: mock_verifier})

    # When
    service.save_pending_signature(
        context,
        alice.address,
        SignatureOpType.TOS,
        {"message": "test_message"},
        "0.0.0.0",
    )

    # Then
    result = database.multisig_signature.get_last_pending_signature(
        alice.address, SignatureOpType.TOS
    )

    assert result.address == alice.address
    assert result.type == SignatureOpType.TOS
    assert result.status == SigStatus.PENDING
    assert result.message == '{"message": "test_message"}'
    assert result.user_ip == "0.0.0.0"
    assert (
        result.hash
        == "0x15259cb98ed495a577ec69a3a75f3b16168507d0099b70483fdab3d0d1b3e71a"
    )


def test_does_not_save_signature_when_verification_returns_false(
    context, alice, mock_verifier
):
    mock_verifier.verify_logic.return_value = False
    service = OffchainMultisigSignatures(verifiers={SignatureOpType.TOS: mock_verifier})

    with pytest.raises(InvalidMultisigSignatureRequest):
        service.save_pending_signature(
            context,
            alice.address,
            SignatureOpType.TOS,
            {"message": "test_message"},
            "0.0.0.0",
        )
    result = database.multisig_signature.get_last_pending_signature(
        alice.address, SignatureOpType.TOS
    )
    assert result is None


def test_does_not_save_signature_when_verification_throws_exception(context, alice):
    class MockVerifier(Verifier):
        def _verify_logic(self, context, **kwargs):
            raise ValueError("logic")

        def _verify_signature(self, context, **kwargs):
            return True

    service = OffchainMultisigSignatures(
        verifiers={SignatureOpType.TOS: MockVerifier()}
    )

    with pytest.raises(ValueError):
        service.save_pending_signature(
            context,
            alice.address,
            SignatureOpType.TOS,
            {"message": "test_message"},
            "0.0.0.0",
        )
    result = database.multisig_signature.get_last_pending_signature(
        alice.address, SignatureOpType.TOS
    )
    assert result is None

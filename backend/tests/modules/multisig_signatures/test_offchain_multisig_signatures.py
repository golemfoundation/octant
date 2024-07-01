import pytest

from app.exceptions import InvalidMultisigSignatureRequest, InvalidMultisigAddress
from app.extensions import db
from app.infrastructure import database
from app.infrastructure.database.multisig_signature import SigStatus
from app.modules.common.verifier import Verifier
from app.modules.dto import SignatureOpType
from app.modules.multisig_signatures.dto import Signature
from app.modules.multisig_signatures.service.offchain import OffchainMultisigSignatures
from tests.helpers.constants import MULTISIG_ADDRESS


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
        "last safe pending hash",
        "0.0.0.0",
    )
    database.multisig_signature.save_signature(
        alice.address,
        SignatureOpType.ALLOCATION,
        "test_message",
        "test_hash",
        "safe_test_hash",
        "0.0.0.0",
        status=SigStatus.APPROVED,
    )
    database.multisig_signature.save_signature(
        alice.address,
        SignatureOpType.TOS,
        "test_message",
        "test_hash",
        "safe_test_hash",
        "0.0.0.0",
    )
    database.multisig_signature.save_signature(
        bob.address,
        SignatureOpType.ALLOCATION,
        "test_message",
        "test_hash",
        "safe_test_hash",
        "0.0.0.0",
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
    assert result.msg_hash == "last pending hash"
    assert result.safe_msg_hash == "last safe pending hash"


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


def test_save_str_msg_signature_when_verified_successfully(
    context, mock_verifier, patch_get_message_hash, patch_safe_api_message_details
):
    # Given
    message = "Welcome to Octant.\nPlease click to sign in and accept the Octant Terms of Service.\n\nSigning this message will not trigger a transaction.\n\nYour address\n0x250f72267551dd4B299Fd1C2407acbbacD96d204"
    service = OffchainMultisigSignatures(verifiers={SignatureOpType.TOS: mock_verifier})

    # When
    service.save_pending_signature(
        context,
        MULTISIG_ADDRESS,
        SignatureOpType.TOS,
        {"message": message},
        "0.0.0.0",
    )

    # Then
    result = database.multisig_signature.get_last_pending_signature(
        MULTISIG_ADDRESS, SignatureOpType.TOS
    )

    assert result.address == MULTISIG_ADDRESS
    assert result.type == SignatureOpType.TOS
    assert result.status == SigStatus.PENDING
    assert result.message == message
    assert result.user_ip == "0.0.0.0"
    assert (
        result.msg_hash
        == "0xc995b1c20cdd79e48a0696bb36f645925c45ef5f8c75ea49974b1ebb556351ca"
    )
    assert (
        result.safe_msg_hash
        == "0xa9539013c03ea436e37924c90e3f9d7773feb867982eda2f2eedad0db066547f"
    )


def test_save_dict_msg_signature_when_verified_successfully(
    context, mock_verifier, patch_get_message_hash, patch_safe_api_message_details
):
    # Given
    service = OffchainMultisigSignatures(
        verifiers={SignatureOpType.ALLOCATION: mock_verifier}
    )

    # When
    service.save_pending_signature(
        context,
        MULTISIG_ADDRESS,
        SignatureOpType.ALLOCATION,
        {
            "message": {
                "isManuallyEdited": False,
                "payload": {
                    "allocations": [
                        {
                            "amount": "26615969581749",
                            "proposalAddress": "0x78e084445C3F1006617e1f36794dd2261ecE4AE3",
                        }
                    ],
                    "nonce": 1,
                },
            }
        },
        "0.0.0.0",
    )

    # Then
    result = database.multisig_signature.get_last_pending_signature(
        MULTISIG_ADDRESS, SignatureOpType.ALLOCATION
    )

    assert result.address == MULTISIG_ADDRESS
    assert result.type == SignatureOpType.ALLOCATION
    assert result.status == SigStatus.PENDING
    assert (
        result.message
        == '{"isManuallyEdited": false, "payload": {"allocations": [{"amount": 26615969581749, "proposalAddress": "0x78e084445C3F1006617e1f36794dd2261ecE4AE3"}], "nonce": 1}}'
    )
    assert result.user_ip == "0.0.0.0"
    assert (
        result.safe_msg_hash
        == "0x58c5c0841f72c744777a2ab04a86dba3afa55286e668dffb98224ff78e151d8f"
    )
    assert (
        result.msg_hash
        == "0xc995b1c20cdd79e48a0696bb36f645925c45ef5f8c75ea49974b1ebb556351ca"
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


def test_does_not_save_signature_when_wrong_user_address(
    context,
    alice,
    patch_safe_api_message_details,
    mock_verifier,
    patch_get_message_hash,
):
    service = OffchainMultisigSignatures(verifiers={SignatureOpType.TOS: mock_verifier})

    with pytest.raises(InvalidMultisigAddress) as exc:
        service.save_pending_signature(
            context,
            alice.address,
            SignatureOpType.TOS,
            {"message": "test_message"},
            "0.0.0.0",
        )

    assert exc.value.description == "Given multisig address is invalid"

    result = database.multisig_signature.get_last_pending_signature(
        alice.address, SignatureOpType.TOS
    )
    assert result is None


def test_does_not_save_signature_when_service_returns_404(
    context,
    alice,
    patch_safe_api_message_details_for_404_error,
    mock_verifier,
    patch_get_message_hash,
):
    service = OffchainMultisigSignatures(verifiers={SignatureOpType.TOS: mock_verifier})

    with pytest.raises(InvalidMultisigAddress) as exc:
        service.save_pending_signature(
            context,
            alice.address,
            SignatureOpType.TOS,
            {"message": "test_message"},
            "0.0.0.0",
        )

    assert exc.value.description == "Given multisig address is invalid"

    result = database.multisig_signature.get_last_pending_signature(
        alice.address, SignatureOpType.TOS
    )
    assert result is None

import pytest

from app.extensions import db
from app.infrastructure import database
from app.infrastructure.database.multisig_signature import SigStatus
from app.modules.dto import SignatureOpType
from app.modules.multisig_signatures.service.offchain import OffchainMultisigSignatures
from tests.helpers.constants import MULTISIG_MOCKED_HASH, MULTISIG_MOCKED_MESSAGE
from tests.helpers.signature import get_signature_by_id


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_approve_all_pending_signatures_when_exist(
    context,
    alice,
    mock_pending_multisig_signatures,
    patch_safe_api_message_details,
    patch_safe_api_user_details,
):
    service = OffchainMultisigSignatures(verifiers={})

    approved_messages = service.approve_pending_signatures(context)

    assert len(approved_messages) == 2
    for approved_message in approved_messages:
        assert approved_message.message == MULTISIG_MOCKED_MESSAGE
        assert approved_message.hash == MULTISIG_MOCKED_HASH

    db.session.commit()


def test_approve_all_pending_signatures_when_only_approved_exist(
    context, mock_approved_multisig_signatures
):
    service = OffchainMultisigSignatures(verifiers={})

    approved_messages = service.approve_pending_signatures(context)

    assert len(approved_messages) == 0


def test_approve_all_pending_signatures_when_approved_and_pending_exist(
    context,
    mock_approved_multisig_signatures,
    mock_pending_multisig_signatures,
    patch_safe_api_message_details,
    patch_safe_api_user_details,
):
    service = OffchainMultisigSignatures(verifiers={})

    approved_signatures = service.approve_pending_signatures(context)

    assert len(approved_signatures) == 2
    for approved_signature in approved_signatures:
        assert approved_signature.message == MULTISIG_MOCKED_MESSAGE
        assert approved_signature.hash == MULTISIG_MOCKED_HASH


def test_approve_pending_allocation_signature_when_already_staged(
    context,
    alice,
    mock_pending_allocation_signature,
    mock_pending_tos_signature,
    patch_safe_api_user_details,
    patch_safe_api_message_details,
):
    service = OffchainMultisigSignatures(verifiers={})
    pending_signature = database.multisig_signature.get_last_pending_signature(
        alice.address, SignatureOpType.ALLOCATION
    )

    service.staged_signatures.append(pending_signature)
    approved_signatures = service.approve_pending_signatures(context)

    assert len(approved_signatures) == 2
    assert len(service.staged_signatures) == 2

    for approved_signature in approved_signatures:
        assert approved_signature.message == MULTISIG_MOCKED_MESSAGE
        assert approved_signature.hash == MULTISIG_MOCKED_HASH


def test_apply_pending_tos_signature(
    context,
    alice,
    mock_pending_tos_signature,
    patch_safe_api_user_details,
    patch_safe_api_message_details,
):
    service = OffchainMultisigSignatures(verifiers={})

    pending_signature = database.multisig_signature.get_last_pending_signature(
        alice.address, SignatureOpType.TOS
    )

    service.approve_pending_signatures(context)
    service.apply_staged_signatures(context, pending_signature.id)

    updated_signature = get_signature_by_id(pending_signature.id)

    assert updated_signature.status == SigStatus.APPROVED
    assert len(service.staged_signatures) == 0


def test_apply_pending_allocation_signature(
    context,
    alice,
    mock_pending_allocation_signature,
    patch_safe_api_message_details,
    patch_safe_api_user_details,
):
    service = OffchainMultisigSignatures(verifiers={})

    pending_signature = database.multisig_signature.get_last_pending_signature(
        alice.address, SignatureOpType.ALLOCATION
    )

    service.approve_pending_signatures(context)
    service.apply_staged_signatures(context, pending_signature.id)

    updated_signature = get_signature_by_id(pending_signature.id)

    assert updated_signature.status == SigStatus.APPROVED
    assert len(service.staged_signatures) == 0

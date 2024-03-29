import pytest

from app.modules.multisig_signatures.service.offchain import OffchainMultisigSignatures
from app.infrastructure import database
from app.modules.dto import SignatureOpType
from app.infrastructure.database.multisig_signature import SigStatus
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

    approved_messages = service.approve_pending_signatures(context)

    assert len(approved_messages) == 2
    for approved_message in approved_messages:
        assert approved_message.message == MULTISIG_MOCKED_MESSAGE
        assert approved_message.hash == MULTISIG_MOCKED_HASH


def test_apply_pending_tos_signature(context, alice, mock_pending_tos_signature):
    service = OffchainMultisigSignatures(verifiers={})

    pending_signature = database.multisig_signature.get_last_pending_signature(
        alice.address, SignatureOpType.TOS
    )
    service.apply_staged_signatures(context, pending_signature.id)

    updated_signature = get_signature_by_id(pending_signature.id)

    assert updated_signature.status == SigStatus.APPROVED


def test_apply_pending_allocation_signature(
    context, alice, mock_pending_allocation_signature
):
    service = OffchainMultisigSignatures(verifiers={})

    pending_signature = database.multisig_signature.get_last_pending_signature(
        alice.address, SignatureOpType.ALLOCATION
    )
    service.apply_staged_signatures(context, pending_signature.id)

    updated_signature = get_signature_by_id(pending_signature.id)

    assert updated_signature.status == SigStatus.APPROVED

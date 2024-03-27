import pytest

from app.modules.multisig_signatures.service.offchain import OffchainMultisigSignatures
from tests.helpers.constants import MULTISIG_MOCKED_HASH, MULTISIG_MOCKED_MESSAGE


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

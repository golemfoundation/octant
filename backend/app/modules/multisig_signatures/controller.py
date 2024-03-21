from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.modules.multisig_signatures.dto import Signature, SignatureOpType
from app.modules.registry import get_services


def get_last_pending_signature(
    user_address: str, op_type: SignatureOpType
) -> Signature:
    context = state_context(EpochState.CURRENT)
    service = get_services(context.epoch_state).multisig_signatures_service

    return service.get_last_pending_signature(context, user_address, op_type)


def save_pending_signature(
    user_address: str, op_type: SignatureOpType, signature_data: dict
):
    context = state_context(EpochState.CURRENT)
    service = get_services(context.epoch_state).multisig_signatures_service

    return service.save_pending_signature(
        context, user_address, op_type, signature_data
    )

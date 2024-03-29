from app.context.epoch_state import EpochState
from app.context.manager import state_context, Context
from app.modules.dto import SignatureOpType
from app.modules.multisig_signatures.dto import Signature
from app.modules.registry import get_services


def get_last_pending_signature(
    user_address: str, op_type: SignatureOpType
) -> Signature:
    context = _get_context(op_type)
    service = get_services(context.epoch_state).multisig_signatures_service

    return service.get_last_pending_signature(context, user_address, op_type)


def save_pending_signature(
    user_address: str, op_type: SignatureOpType, signature_data: dict, user_ip: str
):
    context = _get_context(op_type)
    service = get_services(context.epoch_state).multisig_signatures_service

    return service.save_pending_signature(
        context, user_address, op_type, signature_data, user_ip
    )


def _get_context(op_type: SignatureOpType) -> Context:
    if op_type == SignatureOpType.ALLOCATION:
        return state_context(EpochState.PENDING)
    elif op_type == SignatureOpType.TOS:
        return state_context(EpochState.CURRENT)

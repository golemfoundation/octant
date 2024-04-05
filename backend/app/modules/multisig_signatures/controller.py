from app.context.epoch_state import EpochState
from app.context.manager import state_context, Context
from app.modules.dto import SignatureOpType
from app.modules.multisig_signatures.dto import Signature, ApprovedSignatureTypes
from app.modules.registry import get_services
from app.exceptions import InvalidEpoch


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


def approve_pending_signatures() -> ApprovedSignatureTypes:
    allocation_approvals = _approve(SignatureOpType.ALLOCATION)
    tos_approvals = _approve(SignatureOpType.TOS)

    return ApprovedSignatureTypes(
        allocation_signatures=allocation_approvals, tos_signatures=tos_approvals
    )


def apply_pending_tos_signature(signature_id: int):
    _apply(SignatureOpType.TOS, signature_id)


def apply_pending_allocation_signature(signature_id: int):
    _apply(SignatureOpType.ALLOCATION, signature_id)


def _apply(op_type: SignatureOpType, signature_id):
    try:
        context = _get_context(op_type)
    except InvalidEpoch:
        return None

    service = get_services(context.epoch_state).multisig_signatures_service

    service.apply_staged_signatures(context, signature_id)


def _approve(op_type: SignatureOpType) -> list[Signature]:
    try:
        context = _get_context(op_type)
    except InvalidEpoch:
        return []

    service = get_services(context.epoch_state).multisig_signatures_service

    return service.approve_pending_signatures(context, op_type)


def _get_context(op_type: SignatureOpType) -> Context:
    if op_type == SignatureOpType.ALLOCATION:
        return state_context(EpochState.PENDING)
    elif op_type == SignatureOpType.TOS:
        return state_context(EpochState.CURRENT)

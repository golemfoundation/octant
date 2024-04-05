import json

from app.modules.multisig_signatures.controller import (
    apply_pending_tos_signature,
    apply_pending_allocation_signature,
    approve_pending_signatures,
)
from app.modules.user.allocations.controller import allocate
from app.modules.user.tos.controller import post_user_terms_of_service_consent


def confirm_multisig():
    """
    This is a facade function that is used to confirm (i.e approve and apply) multisig approvals.
    Uses multisig_signatures & user modules to confirm multisig approvals.
    """
    approvals = approve_pending_signatures()

    for tos_signature in approvals.tos_signatures:
        post_user_terms_of_service_consent(
            tos_signature.user_address, tos_signature.hash, tos_signature.ip_address
        )
        apply_pending_tos_signature(tos_signature.id)

    for allocation_signature in approvals.allocation_signatures:
        message = json.loads(allocation_signature.message)
        allocate(
            allocation_signature.user_address,
            message["payload"],
            is_manually_edited=message["is_manually_edited"],
        )
        apply_pending_allocation_signature(allocation_signature.id)

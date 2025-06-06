import json

from flask import current_app as app

from app.modules.multisig_signatures.controller import (
    apply_pending_tos_signature,
    apply_pending_allocation_signature,
    approve_pending_signatures,
)
from app.modules.user.allocations import controller as allocations_controller
from app.modules.user.tos import controller as tos_controller
from app.modules.common.synchronized import synchronized


@synchronized
def confirm_multisig():
    """
    This is a facade function that is used to confirm (i.e approve and apply) multisig approvals.
    Uses multisig_signatures & user modules to confirm multisig approvals.
    """
    approvals = approve_pending_signatures()

    for tos_signature in approvals.tos_signatures:
        # We don't want to fail the whole process if one TOS fails
        try:
            tos_controller.post_user_terms_of_service_consent(
                tos_signature.user_address,
                tos_signature.signature,
                tos_signature.ip_address,
            )
            apply_pending_tos_signature(tos_signature.id)

        except Exception as e:
            app.logger.error(f"Error confirming TOS signature: {e}")

    for allocation_signature in approvals.allocation_signatures:
        # We don't want to fail the whole process if one allocation fails
        try:
            message = json.loads(allocation_signature.message)
            message["signature"] = allocation_signature.signature
            allocations_controller.allocate(
                allocation_signature.user_address,
                message,
                is_manually_edited=message.get("isManuallyEdited"),
            )
            apply_pending_allocation_signature(allocation_signature.id)

        except Exception as e:
            app.logger.error(f"Error confirming allocation signature: {e}")

from flask import current_app as app
from flask_restx import Namespace, fields

from app.extensions import api
from app.infrastructure import OctantResource
from app.modules.dto import SignatureOpType
from app.modules.multisig_signatures.controller import (
    get_last_pending_signature,
    save_pending_signature,
    approve_pending_signatures,
    apply_pending_allocation_signature,
    apply_pending_tos_signature,
)
from app.modules.user.allocations.controller import allocate
from app.modules.user.tos.controller import post_user_terms_of_service_consent


ns = Namespace(
    "multisig-signatures",
    description="Information about multisig signatures stored in Octant.",
)
api.add_namespace(ns)

pending_signature_response = api.model(
    "PendingSignature",
    {
        "message": fields.String(description="The message to be signed."),
        "hash": fields.String(description="The hash of the message."),
    },
)

pending_signature_request = api.model(
    "PendingSignature",
    {
        "message": fields.String(description="The message to be signed."),
    },
)


@ns.route("/pending/<string:user_address>/type/<string:op_type>")
class MultisigPendingSignature(OctantResource):
    @ns.marshal_with(pending_signature_response)
    @ns.response(200, "Success")
    @ns.doc(
        description="Retrieve last pending multisig signature for a specific user and type."
    )
    def get(self, user_address: str, op_type: str):
        app.logger.debug(
            f"Retrieving last pending multisig signature for user {user_address} and type {op_type}."
        )
        response = get_last_pending_signature(user_address, SignatureOpType(op_type))
        app.logger.debug(f"Retrieved last pending multisig signature {response}.")

        return response

    @ns.expect(pending_signature_request)
    @ns.response(201, "Success")
    def post(self, user_address: str, op_type: str):
        app.logger.debug(
            f"Adding new multisig signature for user {user_address} and type {op_type}."
        )
        message = api.payload
        save_pending_signature(user_address, SignatureOpType(op_type), message)
        app.logger.debug("Added new multisig signature.")

        return {}, 201


@ns.route("/pending/approve")
class MultisigApprovePending(OctantResource):
    @ns.response(204, "Success")
    @ns.doc(description="Approve pending multisig messages.")
    def patch(self):
        app.logger.debug("Retrieving approved multisig signatures.")
        approvals = approve_pending_signatures()

        for tos_signature in approvals.tos_signatures:
            app.logger.debug(f"Applying TOS approved signatures {tos_signature}.")
            user_address = tos_signature.message.splitlines()[-1]
            post_user_terms_of_service_consent(
                user_address, tos_signature.hash, tos_signature.ip_address
            )
            apply_pending_tos_signature(tos_signature.id)

        for allocation_signature in approvals.allocation_signatures:
            app.logger.debug(
                f"Applying allocation approved signatures {allocation_signature}."
            )
            allocate(dict(allocation_signature.message))
            apply_pending_allocation_signature(allocation_signature.id)

        return {}, 204

from flask import current_app as app
from flask_restx import Namespace, fields

from app.extensions import api
from app.infrastructure import OctantResource
from app.modules.dto import SignatureOpType
from app.modules.multisig_signatures.controller import (
    get_last_pending_signature,
    save_pending_signature,
    approve_pending_signatures,
)

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
        app.logger.debug("Approving pending multisig signatures.")
        approvals = approve_pending_signatures()
        app.logger.debug(f"Approved {len(approvals)} pending multisig messages.")

        return {}, 204

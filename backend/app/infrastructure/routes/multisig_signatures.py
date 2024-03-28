from flask import current_app as app
from flask_restx import Namespace, fields

from app.extensions import api
from app.infrastructure import OctantResource
from app.modules.dto import SignatureOpType
from app.modules.multisig_signatures.controller import (
    get_last_pending_signature,
    save_pending_signature,
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

from flask import current_app as app, request
from flask_restx import Namespace, fields, reqparse

from app.extensions import api
from app.infrastructure import OctantResource
from app.modules.dto import SignatureOpType
from app.modules.facades.confirm_multisig import confirm_multisig
from app.modules.multisig_signatures.controller import (
    get_last_pending_signature,
    save_pending_signature,
)
from app.settings import config

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

pending_signature_request_parser = reqparse.RequestParser()
pending_signature_request_parser.add_argument(
    "message", required=True, type=str, location="json"
)
pending_signature_request_parser.add_argument(
    "x-real-ip",
    required=config.X_REAL_IP_REQUIRED,
    location="headers",
    case_sensitive=False,
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

    @ns.expect(pending_signature_request_parser)
    @ns.response(201, "Success")
    def post(self, user_address: str, op_type: str):
        app.logger.debug(
            f"Adding new multisig signature for user {user_address} and type {op_type}."
        )
        args = pending_signature_request_parser.parse_args()
        signature_data = ns.payload

        if app.config["X_REAL_IP_REQUIRED"]:
            user_ip = args.get("x-real-ip")
        else:
            user_ip = request.remote_addr

        save_pending_signature(
            user_address, SignatureOpType(op_type), signature_data, user_ip
        )
        app.logger.debug("Added new multisig signature.")

        return {}, 201


@ns.route("/pending/approve")
class MultisigApprovePending(OctantResource):
    @ns.response(204, "Success")
    @ns.doc(description="Approve pending multisig messages.")
    def patch(self):
        app.logger.debug("Approving and applying TOS & allocation signatures.")
        confirm_multisig()

        return {}, 204

import json

from flask import current_app as app, request
from flask_restx import Namespace, fields, reqparse

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
        app.logger.debug("Retrieving approved multisig signatures.")
        approvals = approve_pending_signatures()

        for tos_signature in approvals.tos_signatures:
            app.logger.debug(f"Applying TOS approved signatures {tos_signature}.")
            post_user_terms_of_service_consent(
                tos_signature.user_address, tos_signature.hash, tos_signature.ip_address
            )
            apply_pending_tos_signature(tos_signature.id)

        for allocation_signature in approvals.allocation_signatures:
            app.logger.debug(
                f"Applying allocation approved signatures {allocation_signature}."
            )
            message = json.loads(allocation_signature.message)
            allocate(
                allocation_signature.user_address,
                allocation_signature["payload"],
                is_manually_edited=message["is_manually_edited"],
            )
            apply_pending_allocation_signature(allocation_signature.id)

        return {}, 204

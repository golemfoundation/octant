from flask import current_app as app, request
from flask_restx import Namespace, fields
from flask_restx import reqparse

import app.legacy.controllers.user as user_controller
from app.extensions import api
from app.infrastructure import OctantResource
from app.modules.user.patron_mode.controller import get_patrons_addresses
from app.modules.user.tos.controller import (
    post_user_terms_of_service_consent,
    get_user_terms_of_service_consent_status,
)
from app.settings import config

ns = Namespace("user", description="Octant user settings")
api.add_namespace(ns)

user_tos_consent_status_model = api.model(
    "TermsOfServiceConsentStatus",
    {
        "accepted": fields.Boolean(
            required=True,
            description="Flag indicating whether user has already accepted Terms of Service",
        ),
    },
)

tos_consent_post_parser = reqparse.RequestParser()
tos_consent_post_parser.add_argument(
    "signature", required=True, type=str, location="json"
)
tos_consent_post_parser.add_argument(
    "x-real-ip",
    required=config.X_REAL_IP_REQUIRED,
    location="headers",
    case_sensitive=False,
)


user_patron_mode_status_model = api.model(
    "PatronModeStatus",
    {
        "status": fields.Boolean(
            required=True,
            description="Flag indicating whether user has enabled patron mode",
        ),
    },
)


patrons_model = api.model(
    "Patrons",
    {
        "patrons": fields.List(
            fields.String, required=True, description="Patrons address"
        ),
    },
)

user_patron_mode_request = api.model(
    "PatronModeRequest",
    {
        "signature": fields.String(
            required=True,
            description="signature of the patron mode status message as a hexadecimal string",
        ),
    },
)


@ns.route("/<string:user_address>/tos")
@ns.doc(
    params={
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)"
    }
)
class TermsOfService(OctantResource):
    @ns.doc(
        description="Returns true if given user has already accepted Terms of Service, false in the other case.",
    )
    @ns.marshal_with(user_tos_consent_status_model)
    @ns.response(200, "User's consent to Terms of Service status retrieved")
    def get(self, user_address):
        app.logger.debug(f"Getting user {user_address} ToS consent status")
        consent_status = get_user_terms_of_service_consent_status(user_address)
        app.logger.debug(f"User {user_address} ToS consent status: {consent_status}")

        return {"accepted": consent_status}

    @ns.doc(
        description="Returns true if given user has already accepted Terms of Service, false in the other case.",
    )
    @ns.expect(tos_consent_post_parser)
    @ns.marshal_with(user_tos_consent_status_model)
    @ns.response(201, "User's consent to Terms of Service status updated.")
    @ns.response(400, "Could not update user consent status.")
    def post(self, user_address):
        app.logger.info(f"Updating user {user_address} ToS consent status")

        args = tos_consent_post_parser.parse_args()

        signature = ns.payload.get("signature")

        if app.config["X_REAL_IP_REQUIRED"]:
            user_ip = args.get("x-real-ip")
        else:
            user_ip = request.remote_addr

        post_user_terms_of_service_consent(user_address, signature, user_ip)
        app.logger.info(f"User {user_address} ToS consent status updated")

        return {"accepted": True}, 201


@ns.route("/<string:user_address>/patron-mode")
@ns.doc(
    params={
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)"
    }
)
class PatronMode(OctantResource):
    @ns.doc(
        description="Returns true if given user has enabled patron mode, false in the other case.",
    )
    @ns.marshal_with(user_patron_mode_status_model)
    @ns.response(200, "User's patron mode status retrieved")
    def get(self, user_address: str):
        app.logger.debug(f"Getting user {user_address} patron mode status")
        patron_mode_status = user_controller.get_patron_mode_status(user_address)
        app.logger.debug(
            f"User {user_address} patron mode status: {patron_mode_status}"
        )

        return {"status": patron_mode_status}

    @ns.doc(
        description="Toggle patron mode status",
    )
    @ns.expect(user_patron_mode_request)
    @ns.marshal_with(user_patron_mode_status_model)
    @ns.response(204, "User's patron mode status updated.")
    @ns.response(400, "Could not update patron mode status.")
    def patch(self, user_address: str):
        signature = ns.payload.get("signature")

        app.logger.info(f"Updating user {user_address} patron mode status")
        patron_mode_status = user_controller.toggle_patron_mode(user_address, signature)
        app.logger.info(
            f"User {user_address} patron mode status updated to {patron_mode_status}"
        )

        return {"status": patron_mode_status}, 200


@ns.route("/patrons/<int:epoch>")
class Patrons(OctantResource):
    @ns.doc(
        description="Returns a list of users who toggled patron mode and has a positive budget in given epoch",
        params={
            "epoch": "Epoch number",
        },
    )
    @ns.marshal_with(patrons_model)
    @ns.response(200, "Patrons addresses retrieved")
    def get(self, epoch: int):
        app.logger.debug(f"Getting patrons addresses for epoch {epoch}")
        patrons = get_patrons_addresses(epoch)
        app.logger.debug(f"Patrons addresses: {patrons}")

        return {"patrons": patrons}

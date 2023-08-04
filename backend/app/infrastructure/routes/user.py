from flask import current_app as app
from flask_restx import Resource, Namespace, fields
from flask_restx import reqparse

import app.controllers.user as user_controller
from app.extensions import api
from app.infrastructure import OctantResource

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
    "x-real-ip", required=True, location="headers", case_sensitive=False
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
        consent_status = user_controller.get_user_terms_of_service_consent_status(
            user_address
        )
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
        user_ip = args.get("x-real-ip")

        user_controller.post_user_terms_of_service_consent(
            user_address, signature, user_ip
        )
        app.logger.info(f"User {user_address} ToS consent status updated")

        return {"accepted": True}, 201

from flask_restx import Namespace, fields

from app.extensions import api
from app.infrastructure import OctantResource

from flask import current_app as app

from app.modules.score_delegation import controller

ns = Namespace("delegation", description="UQ score delegation")
api.add_namespace(ns)


score_delegation_payload = api.model(
    "Delegation",
    {
        "primaryAddr": fields.String(
            required=True,
            description="User primary ethereum address in hexadecimal form (case-insensitive, prefixed with 0x)",
        ),
        "secondaryAddr": fields.String(
            required=True,
            description="User secondary ethereum address in hexadecimal form (case-insensitive, prefixed with 0x)",
        ),
        "primaryAddrSignature": fields.String(
            required=True,
            description="Primary address signature of the message: Delegation of UQ score from {secondary_addr} to {primary_addr}",
        ),
        "secondaryAddrSignature": fields.String(
            required=True,
            description="Secondary address signature of the message: Delegation of UQ score from {secondary_addr} to {primary_addr}",
        ),
    },
)


@ns.route("/delegate")
@ns.doc(
    description="Delegates UQ score from secondary address to primary address",
)
class UQScoreDelegation(OctantResource):
    @ns.expect(score_delegation_payload)
    @ns.response(201, "Score successfully delegated")
    def post(self):
        app.logger.debug(
            "Delegating UQ score from secondary address to primary address"
        )
        controller.delegate_uq_score(ns.payload)

        return {}, 201


@ns.route("/recalculate")
@ns.doc(
    description="Recalculates UQ score from secondary address to primary address",
)
class UQScoreRecalculation(OctantResource):
    @ns.expect(score_delegation_payload)
    @ns.response(204, "Score successfully recalculated")
    def put(self):
        app.logger.debug(
            "Recalculating UQ score from secondary address to primary address"
        )
        controller.recalculate_uq_score(ns.payload)

        return {}, 204

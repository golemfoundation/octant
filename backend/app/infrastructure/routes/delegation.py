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


score_delegation_check_model = api.model(
    "ScoreDelegationCheckResult",
    {
        "primary": fields.String(
            required=False,
            description="Address that receives delegated score",
        ),
        "secondary": fields.String(
            required=False,
            description="Address that donates delegated score",
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


@ns.route("/check/<string:addresses>")
@ns.doc(
    description="Allows wallet to check if its accounts are delegating to each other. Implementation of this feature relies on a fact that Ethereum has > 250mil addresses, so blind enumeration is hard. We intend to replace it with proper zk-based delegation as soon as possible",
    params={
        "addresses": "Ethereum addresses in hexadecimal format (case-insensitive, prefixed with 0x), separated by comma. At most 10 addresses at the same time"
    },
)
class UQScoreDelegationCheck(OctantResource):
    @ns.marshal_with(score_delegation_check_model)
    @ns.response(200, "User's delegations reconstructed")
    def get(self, addresses: str):
        secondary, primary = controller.delegation_check(addresses)
        return {"primary": primary, "secondary": secondary}, 200

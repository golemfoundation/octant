from flask_restx import Resource, Namespace, fields

from app.controllers import glm_claim
from app.exceptions import GlmClaimed
from app.extensions import api
from app.settings import config

ns = Namespace("glm", description="Operations related to GLM smart contract")
api.add_namespace(ns)

claim_glm_request = ns.model(
    "ClaimGLMRequest",
    {
        "signature": fields.String(
            required=True,
            description='EIP-712 signature of a payload with the following message: {"msg": "Claim \<AMOUNT-TO-CLAIM-IN-ETHER\> GLMs"} as a hexadecimal string',
        )
    },
)

check_claim_model = api.model(
    "CheckClaim",
    {
        "address": fields.String(
            required=True,
            description="Address of the user",
        ),
        "claimable": fields.String(
            required=True,
            description="Amount of GLMs that can be claimed, in WEI",
        ),
    },
)


@ns.route("/claim")
@ns.doc(
    description="Claim GLMs from epoch 0. Only eligible accounts are able to claim."
)
@ns.response(201, "GLMs claimed successfully")
@ns.response(
    404,
    "User address not found in db - user is not eligible to claim GLMs",
)
@ns.response(
    403,
    "Claiming GLMs is disabled",
)
@ns.response(
    400,
    "GLMs have been already claimed",
)
class Claim(Resource):
    @ns.expect(claim_glm_request)
    def post(self):
        if not config.GLM_CLAIM_ENABLED:
            return {"message": "GLM claiming is disabled"}, 403
        glm_claim.claim(ns.payload["signature"])
        return {}, 201


@ns.route("/claim/<string:user_address>/check")
@ns.doc(
    description="Check if account is eligible are able to claim GLMs from epoch 0. Return number of GLMs in wei"
)
@ns.response(200, "Account is eligible to claim GLMs")
@ns.response(
    404,
    "User address not found in db - user is not eligible to claim GLMs",
)
@ns.response(
    403,
    "Claiming GLMs is disabled",
)
@ns.response(
    400,
    "GLMs have been already claimed",
)
class CheckClaim(Resource):
    @ns.marshal_with(check_claim_model)
    def get(self, user_address: str):
        if not config.GLM_CLAIM_ENABLED:
            return {"message": "GLM claiming is disabled"}, 403
        claimable = str(config.GLM_WITHDRAWAL_AMOUNT)
        try:
            glm_claim.check(user_address)
        except GlmClaimed:
            claimable = "0"

        return {
            "claimable": claimable,
            "address": user_address,
        }, 200

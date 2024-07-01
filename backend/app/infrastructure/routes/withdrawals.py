from flask import current_app as app
from flask_restx import Namespace, fields

from app.extensions import api
from app.infrastructure import OctantResource
from app.modules.withdrawals.controller import get_withdrawable_eth

ns = Namespace("withdrawals", description="Octant withdrawals")
api.add_namespace(ns)

withdrawable_rewards_model = api.model(
    "WithdrawableRewards",
    {
        "epoch": fields.Integer(
            required=True,
            description="Epoch number",
        ),
        "amount": fields.String(
            required=True,
            description="User withdrawable rewards in a particular epoch",
        ),
        "proof": fields.List(
            fields.String,
            required=True,
            description="List of merkle proofs needed to withdraw funds from smart contract",
        ),
        "status": fields.String(
            required=True,
            description="User withdrawable rewards status (pending, available)",
        ),
    },
)


@ns.doc(
    description="Returns a list containing amount and merkle proofs for all not claimed epochs",
    params={
        "address": "User or project address",
    },
)
@ns.response(
    200,
    "",
)
@ns.route("/<string:address>")
class Withdrawals(OctantResource):
    @ns.marshal_with(withdrawable_rewards_model)
    def get(self, address):
        app.logger.debug(f"Getting withdrawable eth for address: {address}")
        result = get_withdrawable_eth(address)
        app.logger.debug(f"Withdrawable eth for address: {address}: {result}")

        return result

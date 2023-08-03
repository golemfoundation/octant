import dataclasses

from flask import current_app
from flask_restx import Resource, Namespace, fields

from app.controllers import withdrawals
from app.extensions import api
from app.settings import config

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
    },
)

if config.EPOCH_2_FEATURES_ENABLED:

    @ns.doc(
        description="Returns a list containing amount and merkle proofs for all not claimed epochs",
        params={
            "address": "User or proposal address",
        },
    )
    @ns.response(
        200,
        "",
    )
    @ns.route("/<string:address>")
    class Withdrawals(Resource):
        @ns.marshal_with(withdrawable_rewards_model)
        def get(self, address):
            current_app.logger.info(
                f"Requested withdrawable eth for address: {address}"
            )
            return [
                dataclasses.asdict(w) for w in withdrawals.get_withdrawable_eth(address)
            ]

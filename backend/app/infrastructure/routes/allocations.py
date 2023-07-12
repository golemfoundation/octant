import dataclasses

from flask_restx import Resource, Namespace, fields

from app.controllers import allocations
from app.extensions import api

ns = Namespace("allocations", description="Octant allocations")
api.add_namespace(ns)


user_allocations_model = api.model(
    "UserAllocations",
    {
        "address": fields.String(
            required=True,
            description="Proposal address",
        ),
        "amount": fields.String(
            required=True,
            description="Funds allocated by user for the proposal in WEI",
        ),
    },
)


@ns.route("/user/<string:user_address>/epoch/<int:epoch>")
@ns.doc(
    description="Returns user's final allocation in a particular epoch",
    params={
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)",
        "epoch": "Epoch number",
    },
)
class UserAllocations(Resource):
    @ns.marshal_with(user_allocations_model)
    @ns.response(200, "User allocations successfully retrieved")
    def get(self, user_address: str, epoch: int):
        return [
            dataclasses.asdict(w)
            for w in allocations.get_all_by_user_and_epoch(user_address, epoch)
        ]

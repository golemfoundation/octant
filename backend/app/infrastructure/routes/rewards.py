from flask import current_app
from flask_restx import Resource, Namespace, fields

from app.controllers import rewards
from app.extensions import api

ns = Namespace("rewards", description="Octant rewards")
api.add_namespace(ns)

user_budget_model = api.model(
    "UserBudget",
    {
        "budget": fields.String(
            required=True, description="User budget for given epoch, BigNumber (wei)"
        ),
    },
)


@ns.route("/some_route/<string:user_address>/epoch/<int:epoch>")
@ns.doc(
    description="Returns user's rewards budget available to allocate for given epoch",
    params={
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)",
        "epoch": "Epoch number",
    },
)
class UserBudget(Resource):
    @ns.marshal_with(user_budget_model)
    @ns.response(200, "Budget successfully retrieved")
    def get(self, user_address, epoch):
        current_app.logger.info(
            f"Getting budget for user: {user_address} in epoch {epoch}"
        )
        budget = rewards.get_user_budget(user_address, epoch)
        return {"budget": budget}

from flask import current_app as app
from flask_restx import Resource, Namespace, fields

from app.controllers import history
from app.extensions import api

ns = Namespace("history", description="User operations overview")
api.add_namespace(ns)

history_item = api.model(
    "HistoryItem",
    {
        "type": fields.String(
            required=True,
            description="Type of action (lock, unlock, allocation, withdrawal)",
        ),
        "amount": fields.String(
            required=True, description="Amount involved in the action, BigNumber (wei)"
        ),
        "timestamp": fields.String(
            required=True,
            description="Timestamp in microseconds when the action occurred (since Unix epoch)",
        ),
    },
)

user_history_model = api.model(
    "UserHistory",
    {
        "history": fields.List(
            fields.Nested(history_item), description="History of user actions"
        )
    },
)


@ns.route("/<string:user_address>")
@ns.doc(
    params={
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)"
    }
)
class History(Resource):
    @ns.marshal_with(user_history_model)
    @ns.response(200, "User history successfully retrieved")
    def get(self, user_address):
        app.logger.debug(f"Getting user: {user_address} history")
        user_history = history.user_history(user_address)
        app.logger.debug(f"User: {user_address} history: {user_history}")

        return {"history": user_history}

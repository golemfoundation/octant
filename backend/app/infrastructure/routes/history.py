from flask import current_app
from flask_restx import Resource, Namespace, fields

from app.core import history
from app.extensions import api

ns = Namespace("history", description="User operations overview")
api.add_namespace(ns)

history_item = api.model(
    "HistoryItem",
    {
        "type": fields.String(
            required=True, description="Type of action (lock, unlock)"
        ),
        "amount": fields.String(
            required=True, description="Amount involved in the action, BigNumber (wei)"
        ),
        "timestamp": fields.Integer(
            required=True,
            description="Timestamp when action occurred (seconds since Unix epoch)",
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
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed with 0x"
    }
)
class History(Resource):
    @ns.marshal_with(user_history_model)
    @ns.response(200, "User history successfully retrieved")
    def get(self, user_address):
        current_app.logger.info(f"Getting history for user: {user_address}")
        user_history = history.get_history(user_address)
        return {"history": user_history}

from flask import current_app as app
from flask_restx import Namespace, fields
from flask import request

from app.legacy.controllers import history
from app.extensions import api
from app.infrastructure import OctantResource

ns = Namespace("history", description="User operations overview")
api.add_namespace(ns)

history_item = api.model(
    "HistoryItem",
    {
        "type": fields.String(
            required=True,
            description="Type of action (lock, unlock, allocation, withdrawal, patron_mode_donation)",
        ),
        "amount": fields.String(
            required=True, description="Amount involved in the action, BigNumber (wei)"
        ),
        "timestamp": fields.String(
            required=True,
            description="Timestamp in microseconds when the action occurred (since Unix epoch)",
        ),
        "transactionHash": fields.String(
            required=False,
            description="Hash of the transaction corresponding to the history item. Field available for locks, unlocks and withdrawals.",
        ),
        "projectAddress": fields.String(
            required=False,
            description="Allocation project address. Field available only for allocation items.",
        ),
        "epoch": fields.Integer(
            required=False,
            description="Epoch in which action occured. Field available only for patron_mode_donation items. ",
        ),
    },
)

user_history_model = api.model(
    "UserHistory",
    {
        "history": fields.List(
            fields.Nested(history_item), description="History of user actions"
        ),
        "next_cursor": fields.String(required=False, description="Next page cursor"),
    },
)


@ns.route("/<string:user_address>")
@ns.doc(
    params={
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)",
    }
)
class History(OctantResource):
    @ns.param("cursor", description="History page cursor", _in="query")
    @ns.param("limit", description="History page size", _in="query")
    @ns.marshal_with(user_history_model)
    @ns.response(200, "User history successfully retrieved")
    def get(self, user_address):
        page_cursor = request.args.get("cursor", type=str)
        page_limit = request.args.get("limit", type=int)

        app.logger.debug(
            f"Getting history for user: {user_address}. Page details:{(page_cursor, page_limit)} "
        )
        user_history, next_cursor = history.user_history(
            user_address, page_cursor, page_limit
        )

        app.logger.debug(f"User: {user_address} history: {user_history}")

        response = {
            "history": [r.to_dict() for r in user_history],
            "next_cursor": next_cursor,
        }

        return response

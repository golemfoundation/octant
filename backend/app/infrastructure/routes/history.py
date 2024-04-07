from flask import current_app as app
from flask_restx import Namespace, fields
from flask import request

from app.extensions import api
from app.infrastructure import OctantResource
from app.modules.history.controller import get_user_history

ns = Namespace("history", description="User operations overview")
api.add_namespace(ns)

project_allocation_item = api.model(
    "ProjectAllocationItem",
    {
        "projectAddress": fields.String(
            required=True,
            description="Allocation project address.",
        ),
        "amount": fields.String(
            required=True, description="Amount donated to a project, BigNumber (wei)"
        ),
    },
)

history_item_data = api.model(
    "HistoryItemData",
    {
        "amount": fields.String(
            required=True, description="Amount involved in the action, BigNumber (wei)"
        ),
        "transactionHash": fields.String(
            required=False,
            description="Hash of the transaction corresponding to the history item. Field available for locks, unlocks and withdrawals.",
        ),
        "epoch": fields.Integer(
            required=False,
            description="Epoch in which action occured. Field available only for patron_mode_donation items. ",
        ),
        "isManuallyEdited": fields.Boolean(
            required=False,
            description="Whether has the allocation been manually edited by the user. Field available only for allocation items.",
        ),
        "leverage": fields.String(
            required=False,
            description="Leverage of the allocated funds. Field available only for allocation items.",
        ),
        "allocations": fields.List(
            fields.Nested(project_allocation_item),
            required=False,
            description="Project allocation items. Field available only for allocation items.",
        ),
    },
)

history_item = api.model(
    "HistoryItem",
    {
        "type": fields.String(
            required=True,
            description="Type of action (lock, unlock, allocation, withdrawal, patron_mode_donation)",
        ),
        "timestamp": fields.String(
            required=True,
            description="Timestamp in seconds when the action occurred (since Unix epoch)",
        ),
        "eventData": fields.Nested(
            history_item_data, required=True, description="History event data"
        ),
    },
)

user_history_model = api.model(
    "UserHistory",
    {
        "history": fields.List(
            fields.Nested(history_item), description="History of user actions"
        ),
        "nextCursor": fields.String(required=False, description="Next page cursor"),
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
        response = get_user_history(user_address, page_cursor, page_limit)
        app.logger.debug(f"User: {user_address} history: {response.history}")

        return response.to_dict()

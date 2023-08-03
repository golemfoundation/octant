from eth_utils import to_checksum_address
from flask_restx import Resource, Namespace, fields

from app.database import pending_epoch_snapshot
import app.controllers.deposits as deposits_controller
from app.extensions import api
from app.settings import config

ns = Namespace("deposits", description="Octant deposits")
api.add_namespace(ns)

total_effective_model = api.model(
    "TotalEffective",
    {
        "totalEffective": fields.String(
            required=True, description="total effective deposit in given epoch"
        ),
    },
)

locked_ratio_model = api.model(
    "LockedRatio",
    {
        "lockedRatio": fields.String(
            required=True, description="GLM locked ratio in given epoch"
        ),
    },
)

user_effective_deposit_model = api.model(
    "EffectiveDeposit",
    {
        "effectiveDeposit": fields.String(
            required=True, description="Effective GLM deposit, in wei"
        ),
    },
)

if config.EPOCH_2_FEATURES_ENABLED:

    @ns.route("/<int:epoch>/total_effective")
    @ns.doc(
        description="Returns value of total effective deposits made by the end of an epoch. Latest data and data for any given point in time from the past is available in the Subgraph.",
        params={"epoch": "Epoch number"},
    )
    class TotalEffectiveDeposit(Resource):
        @ns.marshal_with(total_effective_model)
        @ns.response(200, "Epoch total effective deposit successfully retrieved")
        def get(self, epoch):
            total_effective_deposit = pending_epoch_snapshot.get_by_epoch_num(
                epoch
            ).total_effective_deposit
            return {"totalEffective": total_effective_deposit}

    @ns.route("/<int:epoch>/locked_ratio")
    @ns.doc(
        description="Returns locked ratio of total effective deposits made by the end of an epoch. Latest data and data for any given point in time from the past is available in the Subgraph.",
        params={"epoch": "Epoch number"},
    )
    class LockedRatio(Resource):
        @ns.marshal_with(locked_ratio_model)
        @ns.response(200, "Epoch locked ratio successfully retrieved")
        def get(self, epoch):
            locked_ratio = pending_epoch_snapshot.get_by_epoch_num(epoch).locked_ratio
            return {"lockedRatio": locked_ratio}


@ns.route("/users/<string:address>/<int:epoch>")
@ns.doc(
    description="Returns user's effective deposit for particular epoch.",
    params={
        "epoch": "Epoch number or keyword 'current'",
        "address": "User ethereum address in hexadecimal form (case-insensitive, prefixed with 0x)",
    },
)
class UserEffectiveDeposit(Resource):
    @ns.marshal_with(user_effective_deposit_model)
    @ns.response(200, "User effective deposit successfully retrieved")
    def get(self, address: str, epoch: int):
        result = deposits_controller.get_by_user_and_epoch(
            to_checksum_address(address), epoch
        )
        return {
            "effectiveDeposit": result,
        }

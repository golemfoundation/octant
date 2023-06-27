from flask_restx import Resource, Namespace, fields

from app.database import pending_epoch_snapshot
from app.extensions import api

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


@ns.route("/<string:epoch>/total_effective")
@ns.doc(params={"epoch": "Epoch number"})
class TotalEffectiveDeposit(Resource):
    @ns.marshal_with(total_effective_model)
    @ns.response(200, "Epoch total effective deposit successfully retrieved")
    def get(self, epoch):
        total_effective_deposit = pending_epoch_snapshot.get_by_epoch_num(
            epoch
        ).total_effective_deposit
        return {"totalEffective": total_effective_deposit}


@ns.route("/<string:epoch>/locked_ratio")
@ns.doc(params={"epoch": "Epoch number"})
class LockedRatio(Resource):
    @ns.marshal_with(locked_ratio_model)
    @ns.response(200, "Epoch locked ratio successfully retrieved")
    def get(self, epoch):
        locked_ratio = pending_epoch_snapshot.get_by_epoch_num(epoch).locked_ratio
        return {"lockedRatio": locked_ratio}

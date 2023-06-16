from flask_restx import Resource, Namespace, fields

from app.database import epoch_snapshot
from app.extensions import api

ns = Namespace("deposits", description="Octant deposits")
api.add_namespace(ns)

total_effective_model = api.model(
    "TotalEffective",
    {
        "totalEffective": fields.String(
            required=True,
            description="total effective deposit in given epoch"
        ),
    },
)

staked_ratio_model = api.model(
    "StakedRatio",
    {
        "stakedRatio": fields.String(
            required=True,
            description="GLM staked ratio in given epoch"
        ),
    },
)


@ns.route("/<string:epoch>/total_effective")
@ns.doc(params={"epoch": "Epoch number"})
class TotalEffectiveDeposit(Resource):
    @ns.marshal_with(total_effective_model)
    @ns.response(200, "Epoch total effective deposit successfully retrieved")
    def get(self, epoch):
        total_effective_deposit = epoch_snapshot.get_by_epoch_num(
            epoch
        ).total_effective_deposit
        return {"totalEffective": total_effective_deposit}


@ns.route("/<string:epoch>/staked_ratio")
@ns.doc(params={"epoch": "Epoch number"})
class StakedRatio(Resource):
    @ns.marshal_with(staked_ratio_model)
    @ns.response(200, "Epoch staked ratio successfully retrieved")
    def get(self, epoch):
        staked_ratio = epoch_snapshot.get_by_epoch_num(epoch).staked_ratio
        return {"stakedRatio": staked_ratio}

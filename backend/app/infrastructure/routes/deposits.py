from flask_restx import Resource, Namespace

from app.database import epoch_snapshot
from app.extensions import api

ns = Namespace("deposits", description="Octant deposits")
api.add_namespace(ns)

@ns.route("/<string:epoch>/total_effective")
@ns.doc(
    params={
        "epoch": "Epoch number"
    }
)
@ns.response(200, "Epoch total effective deposit successfully retrieved")
class TotalEffectiveDeposit(Resource):
    def get(self, epoch):
        total_effective_deposit = epoch_snapshot.get_by_epoch_num(epoch).total_effective_deposit
        return total_effective_deposit



from flask import current_app as app
from flask_restx import fields, Namespace

from app.controllers import epochs
from app.extensions import api
from app.infrastructure import OctantResource, graphql

ns = Namespace("epochs", description="Octant epochs")
api.add_namespace(ns)

current_epoch_model = api.model(
    "CurrentEpoch",
    {
        "currentEpoch": fields.Integer(
            required=True, description="Current epoch number"
        ),
    },
)


@ns.route("/current")
@ns.doc(description="Returns current epoch number")
class CurrentEpoch(OctantResource):
    @ns.marshal_with(current_epoch_model)
    @ns.response(200, "Current epoch successfully retrieved")
    def get(self):
        app.logger.debug("Getting current epoch number")
        current_epoch = epochs.get_current_epoch()
        app.logger.debug(f"Current epoch number: {current_epoch}")

        return {"currentEpoch": current_epoch}


indexed_epoch_model = api.model(
    "IndexedEpoch",
    {
        "currentEpoch": fields.Integer(
            required=True, description="Current epoch number"
        ),
        "indexedEpoch": fields.Integer(
            required=True, description="Indexed epoch number"
        ),
    },
)


@ns.route("/indexed")
@ns.doc(description="Returns last indexed epoch number")
class IndexedEpoch(OctantResource):
    @ns.marshal_with(indexed_epoch_model)
    @ns.response(200, "Current epoch successfully retrieved")
    def get(self):
        app.logger.debug("Getting current epoch number")
        sg_epochs = graphql.epochs.get_epochs()
        sg_epochs = sorted(sg_epochs["epoches"], key=lambda d: d["epoch"])
        app.logger.debug(f"All indexed epochs: {sg_epochs}")
        app.logger.debug(f"Last indexed epoch: {sg_epochs[-1:][0]}")
        current_epoch = epochs.get_current_epoch()
        app.logger.debug(f"Current epoch number: {current_epoch}")

        return {
            "currentEpoch": current_epoch,
            "indexedEpoch": sg_epochs[-1:][0]["epoch"],
        }


epoch_stats_model = api.model(
    "EpochStats",
    {
        "epoch": fields.Integer(required=True, description="Epoch number"),
        "staking_proceeds": fields.String(
            required=True, description="ETH proceeds from staking for the given epoch."
        ),
        "total_effective_deposit": fields.String(
            required=True, description="Effectively locked GLMs for the given epoch"
        ),
        "total_rewards": fields.String(
            required=True, description="Total rewards for the given epoch."
        ),
        "individual_rewards": fields.String(
            required=True, description="Total rewards budget allocated to users rewards"
        ),
        "total_withdrawals": fields.String(
            required=True,
            description="Rewards users decided to withdraw for the given epoch.",
        ),
        "patrons_budget": fields.String(
            required=True, description="Matching fund budget coming from patrons."
        ),
        "matched_rewards": fields.String(
            required=True, description="Total matched rewards for the given epoch."
        ),
    },
)


@ns.route("/info/<int:epoch>")
@ns.doc(
    description="Returns statistics on a given epoch. Returns data only for historic and currently pending epochs.",
    params={
        "epoch": "Epoch number",
    },
)
class EpochStats(OctantResource):
    @ns.marshal_with(epoch_stats_model)
    @ns.response(200, "Epoch statistics successfully retrieved.")
    @ns.response(400, "Epoch snapshot does not exist yet.")
    def get(self, epoch: int):
        app.logger.debug(f"Getting epoch stats for epoch: {epoch}")
        stats = epochs.get_epoch_stats(epoch)
        app.logger.debug(f"Got: {stats}")

        return stats

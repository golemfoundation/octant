from flask import current_app as app
from flask_restx import fields, Namespace

from app.extensions import api, epochs
from app.infrastructure import OctantResource, graphql
from app.modules.octant_rewards.controller import get_octant_rewards

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
        "stakingProceeds": fields.String(
            required=True, description="ETH proceeds from staking for the given epoch."
        ),
        "totalEffectiveDeposit": fields.String(
            required=True, description="Effectively locked GLMs for the given epoch"
        ),
        "totalRewards": fields.String(
            required=True, description="Total rewards for the given epoch."
        ),
        "vanillaIndividualRewards": fields.String(
            required=True, description="Total rewards budget allocated to users rewards"
        ),
        "operationalCost": fields.String(
            required=True, description="The amount needed to cover the Octant's costs"
        ),
        "totalWithdrawals": fields.String(
            required=False,
            description="Rewards users decided to withdraw for the given epoch.",
        ),
        "patronsRewards": fields.String(
            required=False, description="Matching fund budget coming from patrons."
        ),
        "matchedRewards": fields.String(
            required=False,
            description="""Total matched rewards for the given epoch.
            Includes matchedRewards from Golem Foundation and patronRewards.""",
        ),
        "leftover": fields.String(
            required=False,
            description="The amount that will be used to increase staking and for other Octant related operations. Includes donations to projects that didn't reach the threshold.",
        ),
        "ppf": fields.String(
            required=False,
            description="PPF for the given epoch. It's calculated based on substracting Vanillia Individual Rewards from Individual Rewards Equilibrium.",
        ),
        "communityFund": fields.String(
            required=False,
            description="Community fund for the given epoch. It's calculated from staking proceeds directly.",
        ),
        "donatedToProjects": fields.String(
            required=False,
            description="The amount of funds donated to projects. Includes MR and allocations.",
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
        stats = get_octant_rewards(epoch)
        app.logger.debug(f"Got: {stats}")

        return stats.to_dict()

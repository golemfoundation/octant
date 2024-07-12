from flask import Response
from flask import current_app as app
from flask_restx import Namespace, fields

from app.extensions import api
from app.infrastructure import OctantResource
from app.legacy.controllers import snapshots
from app.modules.snapshots.finalized.controller import (
    simulate_finalized_epoch_snapshot,
    create_finalized_epoch_snapshot,
)
from app.modules.snapshots.pending.controller import (
    create_pending_epoch_snapshot,
    simulate_pending_epoch_snapshot,
)

ns = Namespace("snapshots", description="Database snapshots")
api.add_namespace(ns)

epoch_status_model = api.model(
    "EpochStatus",
    {
        "isCurrent": fields.Boolean(
            required=True,
            description="Returns True if the given epoch is the current epoch",
        ),
        "isPending": fields.Boolean(
            required=True,
            description="Returns True if the given epoch is the pending epoch",
        ),
        "isFinalized": fields.Boolean(
            required=True,
            description="Returns True if the given epoch is a finalized epoch",
        ),
    },
)

project_reward_model = api.model(
    "ProjectRewardModel",
    {
        "address": fields.String(),
        "amount": fields.String(),
        "matched": fields.String(),
    },
)

account_funds_model = api.model(
    "UserRewardModel",
    {
        "address": fields.String(),
        "amount": fields.String(),
    },
)

octant_rewards_model = api.model(
    "OctantRewardsModel",
    {
        "stakingProceeds": fields.String(),
        "lockedRatio": fields.String(),
        "totalEffectiveDeposit": fields.String(),
        "totalRewards": fields.String(),
        "vanillaIndividualRewards": fields.String(),
        "operationalCost": fields.String(),
        "communityFund": fields.String(),
        "ppf": fields.String(),
    },
)

user_deposits_model = api.model(
    "UserDepositsModel",
    {
        "userAddress": fields.String(),
        "effectiveDeposit": fields.String(),
        "deposit": fields.String(),
    },
)

user_budgets_model = api.model(
    "UserBudgetsInfoModel",
    {
        "userAddress": fields.String(),
        "budget": fields.String(),
    },
)

finalized_snapshot_model = api.model(
    "FinalizedSnapshotModel",
    {
        "patronsRewards": fields.String(),
        "matchedRewards": fields.String(),
        "projectsRewards": fields.List(fields.Nested(project_reward_model)),
        "userRewards": fields.List(fields.Nested(account_funds_model)),
        "totalWithdrawals": fields.String(),
        "leftover": fields.String(),
        "merkleRoot": fields.String(),
    },
)

pending_snapshot_model = api.model(
    "PendingSnapshotModel",
    {
        "rewards": fields.Nested(octant_rewards_model),
        "userDeposits": fields.List(fields.Nested(user_deposits_model)),
        "userBudgets": fields.List(fields.Nested(user_budgets_model)),
    },
)


@ns.route("/pending")
@ns.doc(
    description="Take a database snapshot of the recently completed epoch. \
        This endpoint should be executed at the beginning of an epoch to activate \
        a decision window."
)
@ns.response(
    200,
    "Snapshot could not be created due to an existing snapshot for previous epoch",
)
@ns.response(201, "Snapshot created successfully")
class PendingEpochSnapshot(OctantResource):
    def post(self):
        app.logger.info("Initiating pending epoch snapshot")
        epoch = create_pending_epoch_snapshot()
        app.logger.info(f"Saved pending epoch snapshot for epoch: {epoch}")

        return ({"epoch": epoch}, 201) if epoch is not None else Response()


@ns.route("/finalized")
@ns.doc(
    description="Take a database snapshot of the recently completed allocations. \
        This endpoint should be executed at the end of the decision window"
)
@ns.response(
    200,
    "Snapshot could not be created due to an existing snapshot for previous epoch",
)
@ns.response(201, "Snapshot created successfully")
class FinalizedEpochSnapshot(OctantResource):
    def post(self):
        app.logger.info("Initiating finalized epoch snapshot")
        epoch = create_finalized_epoch_snapshot()
        app.logger.info(f"Saved finalized epoch snapshot for epoch: {epoch}")

        return ({"epoch": epoch}, 201) if epoch is not None else Response()


@ns.route("/status/<int:epoch>")
@ns.doc(
    description="Returns given epoch's status, whether it's a "
    "current, pending or a finalized epoch. In case all fields are returning False and not "
    "an error, it is likely that there's a pending epoch that has not been snapshotted yet."
)
@ns.response(200, "Epoch status successfully retrieved")
@ns.response(
    400,
    "Invalid epoch number given. Most likely the epoch has not started yet. "
    "Consult the error message.",
)
class EpochStatus(OctantResource):
    @ns.marshal_with(epoch_status_model)
    def get(self, epoch: int):
        app.logger.debug(f"Getting epoch {epoch} status")
        status = snapshots.get_epoch_status(epoch)
        app.logger.debug(f"Epoch {epoch} status: {status}")

        return status.to_dict()


@ns.route("/finalized/simulate")
@ns.doc(description="Simulates the finalized snapshot")
@ns.response(200, "Finalized snapshot simulated successfully")
class SimulateFinalizedSnapshot(OctantResource):
    @ns.marshal_with(finalized_snapshot_model)
    def get(self):
        app.logger.debug("Simulating finalized snapshot")
        response = simulate_finalized_epoch_snapshot()
        return response.to_dict()


@ns.route("/pending/simulate")
@ns.doc(description="Simulates the pending snapshot")
@ns.response(200, "Pending snapshot simulated successfully")
class SimulatePendingSnapshot(OctantResource):
    @ns.marshal_with(pending_snapshot_model)
    def get(self):
        app.logger.debug("Simulating pending snapshot")
        response = simulate_pending_epoch_snapshot()
        return response.to_dict()

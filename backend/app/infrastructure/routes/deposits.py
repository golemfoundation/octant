from flask import current_app as app
from flask_restx import Namespace, fields

from app.infrastructure.database import pending_epoch_snapshot
from app.extensions import api
from app.infrastructure import OctantResource
from app.modules.user.deposits.controller import (
    estimate_total_effective_deposit,
    estimate_user_effective_deposit,
    get_user_effective_deposit,
)

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


@ns.route("/<int:epoch>/total_effective")
@ns.doc(
    description="Returns value of total effective deposits made by the end of an epoch. Latest data and data for any given point in time from the past is available in the Subgraph.",
    params={"epoch": "Epoch number"},
)
class TotalEffectiveDeposit(OctantResource):
    @ns.marshal_with(total_effective_model)
    @ns.response(200, "Epoch total effective deposit successfully retrieved")
    def get(self, epoch):
        app.logger.debug(f"Getting total effective deposit in epoch {epoch}")
        total_effective_deposit = pending_epoch_snapshot.get_by_epoch_num(
            epoch
        ).total_effective_deposit
        app.logger.debug(
            f"Total effective deposit in epoch {epoch}: {total_effective_deposit}"
        )

        return {"totalEffective": total_effective_deposit}


@ns.route("/total_effective/estimated")
@ns.doc(
    description="Returns value of estimated total effective deposits for current epoch."
)
class EstimatedTotalEffectiveDeposit(OctantResource):
    @ns.marshal_with(total_effective_model)
    @ns.response(200, "Epoch estimated total effective deposit successfully retrieved")
    def get(self):
        total = estimate_total_effective_deposit()
        return {"totalEffective": total}


@ns.route("/<int:epoch>/locked_ratio")
@ns.doc(
    description="Returns locked ratio of total effective deposits made by the end of an epoch. Latest data and data for any given point in time from the past is available in the Subgraph.",
    params={"epoch": "Epoch number"},
)
class LockedRatio(OctantResource):
    @ns.marshal_with(locked_ratio_model)
    @ns.response(200, "Epoch locked ratio successfully retrieved")
    def get(self, epoch):
        app.logger.debug(f"Getting locked ratio in epoch {epoch}")
        locked_ratio = pending_epoch_snapshot.get_by_epoch_num(epoch).locked_ratio
        app.logger.debug(f"Locked ratio in epoch {epoch}: {locked_ratio}")

        return {"lockedRatio": locked_ratio}


@ns.route("/users/<string:user_address>/<int:epoch>")
@ns.doc(
    description="Returns user's effective deposit for a finialized or pending epoch.",
    params={
        "epoch": "Epoch number",
        "user_address": "User ethereum address in hexadecimal form (case-insensitive, prefixed with 0x)",
    },
)
class UserEffectiveDeposit(OctantResource):
    @ns.marshal_with(user_effective_deposit_model)
    @ns.response(200, "User effective deposit successfully retrieved")
    def get(self, user_address: str, epoch: int):
        app.logger.debug(
            f"Getting user {user_address} effective deposit in epoch {epoch}"
        )
        result = get_user_effective_deposit(user_address, epoch)
        app.logger.debug(
            f"User {user_address} effective deposit in epoch {epoch}: {result}"
        )

        return {
            "effectiveDeposit": result,
        }


@ns.route("/users/<string:user_address>/estimated_effective_deposit")
@ns.doc(
    description="Returns user's estimated effective deposit for the current epoch.",
    params={
        "user_address": "User ethereum address in hexadecimal form (case-insensitive, prefixed with 0x)",
    },
)
class UserEstimatedEffectiveDeposit(OctantResource):
    @ns.marshal_with(user_effective_deposit_model)
    @ns.response(200, "User estimated effective deposit successfully retrieved")
    def get(self, user_address: str):
        app.logger.debug(
            f"Getting user {user_address} estimated effective deposit in the current epoch"
        )
        result = estimate_user_effective_deposit(user_address)
        app.logger.debug(
            f"User {user_address} estimated effective deposit in the current epoch: {result}"
        )

        return {
            "effectiveDeposit": result,
        }

from eth_utils import to_checksum_address
from flask import current_app as app
from flask_restx import Namespace, fields

import app.controllers.deposits as deposits_controller
from app.database import pending_epoch_snapshot
from app.extensions import api
from app.infrastructure import OctantResource
from app.v2.modules.user.deposits.controller import estimate_total_effective_deposit

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


estimated_total_effective_model = api.model(
    "EstimatedTotalEffective",
    {
        "amount": fields.String(
            required=True,
            description="Estimate total effective deposit in current epoch. Computed with (false) assumption that no more deposits or withdrawals will be made until end of the epoch. Amount in wei, GLM token",
        ),
        "epoch": fields.Integer(required=True, description="Epoch number"),
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
        epoch, total = estimate_total_effective_deposit()
        return {"estimatedTotalEffective": str(total), "epoch": epoch}


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


@ns.route("/users/<string:address>/<int:epoch>")
@ns.doc(
    description="Returns user's effective deposit for a finialized or pending epoch.",
    params={
        "epoch": "Epoch number",
        "address": "User ethereum address in hexadecimal form (case-insensitive, prefixed with 0x)",
    },
)
class UserEffectiveDeposit(OctantResource):
    @ns.marshal_with(user_effective_deposit_model)
    @ns.response(200, "User effective deposit successfully retrieved")
    def get(self, address: str, epoch: int):
        app.logger.debug(f"Getting user {address} effective deposit in epoch {epoch}")
        result = deposits_controller.get_user_effective_deposit_by_epoch(
            to_checksum_address(address), epoch
        )
        app.logger.debug(f"User {address} effective deposit in epoch {epoch}: {result}")

        return {
            "effectiveDeposit": result,
        }


@ns.route("/users/<string:address>/estimated_effective_deposit")
@ns.doc(
    description="Returns user's estimated effective deposit for the current epoch.",
    params={
        "address": "User ethereum address in hexadecimal form (case-insensitive, prefixed with 0x)",
    },
)
class UserEstimatedEffectiveDeposit(OctantResource):
    @ns.marshal_with(user_effective_deposit_model)
    @ns.response(200, "User estimated effective deposit successfully retrieved")
    def get(self, address: str):
        app.logger.debug(
            f"Getting user {address} estimated effective deposit in the current epoch"
        )
        result = (
            deposits_controller.get_user_estimated_effective_deposit_for_current_epoch(
                to_checksum_address(address)
            )
        )
        app.logger.debug(
            f"User {address} estimated effective deposit in the current epoch: {result}"
        )

        return {
            "effectiveDeposit": result,
        }

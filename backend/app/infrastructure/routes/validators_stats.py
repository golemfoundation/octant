from flask import current_app as app
from flask_restx import Namespace, fields
from app.extensions import cache

from app.extensions import api
from app.infrastructure import OctantResource
from app.constants import MAINNET_VALIDATORS_ETHEREUM_ADDRESS
from app.controllers.validators import (
    ValidatorsInfo,
    ActiveValidatorsData,
    get_validators_info_by_address,
    get_active_validators_effective_balance,
)

ns = Namespace("validators", description="Information about Octant validators")
api.add_namespace(ns)

active_validators_model = api.model(
    "ActiveValidatorsSummary",
    {
        "activeValidatorsNumber": fields.Integer(
            required=True, description="The amount of active Octant validators."
        ),
        "ethEffectiveBalance": fields.String(
            required=True,
            description="The sum of effective balances of all active Octant validators in gwei.",
        ),
    },
)


@ns.route("/active/summary")
@ns.doc(
    description="Return the amount of all active Octant validators and the sum of their effective balances in gwei."
)
class ActiveValidatorsSummary(OctantResource):
    @ns.marshal_with(active_validators_model)
    @ns.response(
        200,
        "Successfully retrieved the sum of active validators' effective balances",
    )
    @ns.response(500, "External validators API returned an error")
    # Invalidate cache once in 1 hour. The amount of ETH staked by active nodes
    # should be the same and only change after accumulated and not distributed ETH is staked
    @cache.cached(timeout=6000)
    def get(self):
        app.logger.debug(
            f"Requesting the identifying information about validators for {MAINNET_VALIDATORS_ETHEREUM_ADDRESS}"
        )
        validators_info: ValidatorsInfo = get_validators_info_by_address(
            MAINNET_VALIDATORS_ETHEREUM_ADDRESS
        )
        app.logger.debug("Requesting detailed information about validators")
        active_validators: ActiveValidatorsData = (
            get_active_validators_effective_balance(validators_info.indices)
        )
        app.logger.debug(
            f"The sum of the {active_validators.active_validators_number} active validators' effective balances is {active_validators.effective_balance_sum}"
        )
        return {
            "activeValidatorsNumber": active_validators.active_validators_number,
            "ethEffectiveBalance": str(active_validators.effective_balance_sum),
        }

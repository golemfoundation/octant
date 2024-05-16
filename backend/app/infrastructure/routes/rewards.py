from flask import current_app as app
from flask_restx import Namespace, fields

from app.extensions import api
from app.infrastructure import OctantResource
from app.infrastructure.routes.validations.budget_estimation_input import (
    validate_budget_estimation_input,
)
from app.legacy.controllers import rewards
from app.modules.facades import rewards_estimation as rewards_estimation_facade
from app.modules.octant_rewards.controller import get_leverage
from app.modules.projects.rewards.controller import (
    get_estimated_project_rewards,
    get_allocation_threshold,
)
from app.modules.user.budgets.controller import (
    get_budgets,
    get_budget,
    estimate_budget_by_days,
    get_upcoming_user_budget,
)
from app.modules.user.rewards.controller import get_unused_rewards

ns = Namespace("rewards", description="Octant rewards")
api.add_namespace(ns)

user_budget_with_matched_funding_model = api.model(
    "UserBudget",
    {
        "budget": fields.String(
            required=True, description="User budget for given epoch, BigNumber (wei)"
        ),
        "matchedFunding": fields.String(
            required=True,
            description="User matched funding for given epoch, BigNumber (wei)",
        ),
    },
)

user_budget_model = api.model(
    "UserBudget",
    {
        "budget": fields.String(
            required=True, description="User budget for given epoch, BigNumber (wei)"
        ),
    },
)

epoch_budget_item = api.model(
    "EpochBudgetItem",
    {
        "address": fields.String(required=True, description="User address"),
        "amount": fields.String(
            required=True, description="User budget for given epoch, BigNumber (wei)"
        ),
    },
)

epoch_budget_model = api.model(
    "EpochBudgets",
    {
        "budgets": fields.List(
            fields.Nested(epoch_budget_item),
            required=True,
            description="Users budgets for given epoch, BigNumber (wei)",
        ),
    },
)

threshold_model = api.model(
    "Threshold",
    {
        "threshold": fields.String(
            required=True,
            description="Threshold, that projects have to pass to be eligible for receiving rewards",
        ),
    },
)

budget_model = api.model(
    "Budget",
    {
        "epoch": fields.String(
            required=True,
            description="Epoch number",
        ),
        "allocated": fields.String(
            required=True,
            description="Total user allocated funds for the projects",
        ),
        "matched": fields.String(
            description="Total matched rewards for the projects. Returns null if "
            "epoch is not in the allocation window",
        ),
    },
)

unused_rewards_model = api.model(
    "UnusedRewards",
    {
        "addresses": fields.List(
            fields.String,
            required=True,
            description="Users that neither allocated rewards nor toggled patron mode",
        ),
        "value": fields.String(
            required=True,
            description="Total unused rewards sum in an epoch (WEI)",
        ),
    },
)

leverage_model = api.model(
    "Leverage",
    {
        "leverage": fields.Float(
            required=True, description="Leverage of the allocated funds"
        )
    },
)

estimated_budget_request = ns.model(
    "EstimatedBudget",
    {
        "numberOfEpochs": fields.Integer(
            required=True,
            description="Number of epochs when GLM are locked",
        ),
        "glmAmount": fields.String(
            required=True,
            description="Amount of estimated GLM locked in WEI",
        ),
    },
)

estimated_budget_by_days_request = ns.model(
    "EstimatedBudgetByDays",
    {
        "days": fields.Integer(
            required=True,
            description="Number of days when GLM are locked",
        ),
        "glmAmount": fields.String(
            required=True,
            description="Amount of estimated GLM locked in WEI",
        ),
    },
)

upcoming_user_budget_response = api.model(
    "UpcomingBudgetResponse",
    {
        "upcomingBudget": fields.String(
            required=True, description="Calculated upcoming user budget."
        )
    },
)

epoch_rewards_merkle_tree_leaf_model = api.model(
    "EpochRewardsMerkleTreeLeaf",
    {
        "address": fields.String(
            required=True, description="User account or project address"
        ),
        "amount": fields.String(required=True, description="Assigned reward"),
    },
)

epoch_rewards_merkle_tree_model = api.model(
    "EpochRewardsMerkleTree",
    {
        "epoch": fields.Integer(
            required=True,
            description="Epoch number",
        ),
        "rewardsSum": fields.String(
            required=True, description="Sum of assigned rewards for epoch"
        ),
        "root": fields.String(required=True, description="Merkle Tree root for epoch"),
        "leaves": fields.List(
            fields.Nested(epoch_rewards_merkle_tree_leaf_model),
            required=True,
            description="List of Merkle Tree leaves",
        ),
        "leafEncoding": fields.List(
            fields.String, required=True, description="Merkle tree leaf encoding"
        ),
    },
)

project_rewards_model_item = api.model(
    "Project",
    {
        "address": fields.String(
            required=True,
            description="Project address",
        ),
        "allocated": fields.String(
            required=True,
            description="User allocated funds for the project, wei",
        ),
        "matched": fields.String(
            required=True,
            description="Matched rewards funds for the project, wei",
        ),
    },
)

projects_rewards_model = api.model(
    "ProjectRewards",
    {
        "rewards": fields.List(
            fields.Nested(project_rewards_model_item),
            required=True,
            description="Project rewards",
        ),
    },
)


@ns.route("/budget/<string:user_address>/epoch/<int:epoch>")
@ns.doc(
    description="Returns user's rewards budget available to allocate for given epoch",
    params={
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed "
        "with 0x)",
        "epoch": "Epoch number",
    },
)
class UserBudget(OctantResource):
    @ns.marshal_with(user_budget_model)
    @ns.response(200, "Budget successfully retrieved")
    def get(self, user_address, epoch):
        app.logger.debug(f"Getting user {user_address} budget in epoch {epoch}")
        budget = get_budget(user_address, epoch)
        app.logger.debug(f"User {user_address} budget in epoch {epoch}: {budget}")

        return {"budget": budget}


@ns.route("/budgets/epoch/<int:epoch>")
@ns.doc(
    description="Returns all users rewards budgets for the epoch.",
    params={
        "epoch": "Epoch number",
    },
)
@ns.response(404, "User userAddress does not have a budget for epoch epochNumber")
class EpochBudgets(OctantResource):
    @ns.marshal_with(epoch_budget_model)
    @ns.response(200, "Epoch individual budgets successfully retrieved")
    def get(self, epoch: int):
        app.logger.debug(f"Get budgets for all users in epoch {epoch}")
        budgets = get_budgets(epoch)
        app.logger.debug(f"Budgets for all users in epoch {epoch}: {budgets}")
        return {"budgets": budgets}


@ns.route("/estimated_budget")
@ns.doc(
    description="Returns estimated rewards budget available when GLM locked by given number of full epochs"
)
class EstimatedUserBudget(OctantResource):
    @ns.expect(estimated_budget_request)
    @ns.marshal_with(user_budget_with_matched_funding_model)
    @ns.response(200, "Budget successfully retrieved")
    def post(self):
        no_epochs, glm_amount = ns.payload.get("numberOfEpochs"), ns.payload.get(
            "glmAmount"
        )

        validate_budget_estimation_input(no_epochs=no_epochs, glmAmount=glm_amount)

        glm_amount = int(glm_amount)

        app.logger.debug(
            f"Getting user estimated budget for {no_epochs} epochs and {glm_amount} GLM. Getting matched_funding based on previous epoch."
        )

        rewards = rewards_estimation_facade.estimate_rewards(no_epochs, glm_amount)
        budget = rewards.estimated_budget
        leverage = rewards.leverage
        matching_fund = rewards.matching_fund

        app.logger.debug(
            f"Estimated user budget: {budget}, estimated matching_fund: {matching_fund} with leverage: {leverage}"
        )

        return {"budget": budget, "matchedFunding": matching_fund}


@ns.route("/estimated_budget/by_days")
@ns.doc(
    description="Returns estimated rewards budget available when GLM locked by given period of time"
)
class EstimatedUserBudgetByDays(OctantResource):
    @ns.expect(estimated_budget_by_days_request)
    @ns.marshal_with(user_budget_model)
    @ns.response(200, "Budget successfully retrieved")
    def post(self):
        days, glm_amount = ns.payload.get("days"), ns.payload.get("glmAmount")

        validate_budget_estimation_input(days=days, glmAmount=glm_amount)

        glm_amount = int(glm_amount)

        app.logger.debug(
            f"Getting user estimated budget for {days} days and {glm_amount} GLM"
        )
        budget = estimate_budget_by_days(days, glm_amount)
        app.logger.debug(f"Estimated user budget: {budget}")

        return {"budget": budget}


@ns.route("/threshold/<int:epoch>")
@ns.doc(
    description="Returns allocation threshold for the projects to be eligible for rewards",
    params={
        "epoch": "Epoch number",
    },
)
@ns.response(200, "Returns allocation threshold value as uint256")
@ns.response(400, "Returns when called for an epoch that is not finalized or pending")
class Threshold(OctantResource):
    @ns.marshal_with(threshold_model)
    @ns.response(200, "Threshold successfully retrieved")
    def get(self, epoch):
        app.logger.debug(f"Getting threshold for epoch {epoch}")
        threshold = get_allocation_threshold(epoch)
        app.logger.debug(f"Threshold in epoch: {epoch}: {threshold}")

        return {"threshold": threshold}


@ns.doc(
    description="Returns projects with matched rewards for a given epoch",
    params={
        "epoch": "Epoch number",
    },
)
@ns.response(
    200,
    "",
)
@ns.response(
    400,
    "Invalid epoch number given. The epoch must be finalized",
)
@ns.route("/projects/epoch/<int:epoch>")
class FinalizedProjectsRewards(OctantResource):
    @ns.marshal_with(projects_rewards_model)
    def get(self, epoch):
        app.logger.debug(f"Getting project rewards for a finalized epoch {epoch}")
        project_rewards = rewards.get_finalized_epoch_project_rewards(epoch)
        app.logger.debug(f"Project rewards in epoch: {epoch}: {project_rewards}")

        return {"rewards": project_rewards}


@ns.doc(
    description="Returns project rewards with estimated matched rewards for the pending epoch"
)
@ns.response(
    200,
    "",
)
@ns.route("/projects/estimated")
class EstimatedProjectRewards(OctantResource):
    @ns.marshal_with(projects_rewards_model)
    def get(self):
        app.logger.debug("Getting project rewards for the pending epoch")
        project_rewards = get_estimated_project_rewards().rewards
        app.logger.debug(f"Project rewards in the pending epoch: {project_rewards}")

        return {"rewards": project_rewards}


@ns.route("/unused/<int:epoch>")
class UnusedRewards(OctantResource):
    @ns.doc(
        description="Returns unallocated value and the number of users who didn't use their rewards in an epoch",
        params={
            "epoch": "Epoch number",
        },
    )
    @ns.marshal_with(unused_rewards_model)
    @ns.response(200, "Unused rewards found")
    def get(self, epoch: int):
        app.logger.debug(f"Getting unused rewards for epoch: {epoch}")
        addresses, value = get_unused_rewards(epoch)
        app.logger.debug(f"Unused rewards addresses: {addresses}")
        app.logger.debug(f"Unused rewards value: {value}")

        return {
            "addresses": addresses,
            "value": value,
        }


@ns.route("/leverage/<int:epoch>")
class Leverage(OctantResource):
    @ns.doc(
        description="Returns leverage in given epoch",
        params={
            "epoch": "Epoch number",
        },
    )
    @ns.marshal_with(leverage_model)
    @ns.response(200, "Leverage in given epoch")
    def get(self, epoch: int):
        app.logger.debug(f"Getting leverage for epoch: {epoch}")
        leverage = get_leverage(epoch)
        app.logger.debug(f"Leverage: {leverage}")

        return {"leverage": leverage}


@ns.doc(
    description="Returns merkle tree leaves with rewards for a given epoch",
    params={
        "epoch": "Epoch number",
    },
)
@ns.response(
    200,
    "",
)
@ns.response(400, "Invalid epoch number given")
@ns.route("/merkle_tree/<int:epoch>")
class RewardsMerkleTree(OctantResource):
    @ns.marshal_with(epoch_rewards_merkle_tree_model)
    def get(self, epoch: int):
        app.logger.debug(f"Getting merkle tree leaves for epoch {epoch}")
        merkle_tree_leaves = rewards.get_rewards_merkle_tree(epoch)
        app.logger.debug(f"Merkle tree leaves for epoch {epoch}: {merkle_tree_leaves}")

        return merkle_tree_leaves.to_dict()


@ns.route("/budget/<string:user_address>/upcoming")
@ns.doc(
    description="Returns upcoming user budget based on if allocation happened now.",
    params={
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed "
        "with 0x)"
    },
)
class UpcomingUserBudget(OctantResource):
    @ns.marshal_with(upcoming_user_budget_response)
    @ns.response(200, "Upcoming user budget successfully retrieved")
    def get(self, user_address):
        app.logger.debug(
            f"Getting upcoming user budget amount. User address: {user_address}"
        )

        budget = get_upcoming_user_budget(user_address)

        return {"upcomingBudget": budget}

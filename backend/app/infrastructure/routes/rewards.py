from flask import current_app as app, request
from flask_restx import Namespace, fields

from app.controllers import rewards
from app.controllers.user import estimate_budget, get_budget
from app.extensions import api
from app.infrastructure import OctantResource

ns = Namespace("rewards", description="Octant rewards")
api.add_namespace(ns)

user_budget_model = api.model(
    "UserBudget",
    {
        "budget": fields.String(
            required=True, description="User budget for given epoch, BigNumber (wei)"
        ),
    },
)


epoch_budget_model = api.model(
    "EpochBudgetItem",
    {
        "user": fields.String(required=True, description="User address"),
        "budget": fields.String(
            required=True, description="User budget for given epoch, BigNumber (wei)"
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
            description="Total user allocated funds for the proposals",
        ),
        "matched": fields.String(
            description="Total matched rewards for the proposals. Returns null if "
            "epoch is not in the allocation window",
        ),
    },
)

estimated_budget_request = ns.model(
    "EstimatedBudget",
    {
        "days": fields.Integer(
            required=True,
            description="Number of days when GLM are locked",
        ),
        "glm_amount": fields.String(
            required=True,
            description="Amount of estimated GLM locked in WEI",
        ),
    },
)


epoch_rewards_merkle_tree_leaf_model = api.model(
    "EpochRewardsMerkleTreeLeaf",
    {
        "address": fields.String(
            required=True, description="User account or proposal address"
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

proposals_rewards_model_item = api.model(
    "Proposal",
    {
        "address": fields.String(
            required=True,
            description="Proposal address",
        ),
        "allocated": fields.String(
            required=True,
            description="User allocated funds for the proposal, wei",
        ),
        "matched": fields.String(
            required=True,
            description="Matched rewards funds for the proposal, wei",
        ),
    },
)

proposals_rewards_model = api.model(
    "ProposalRewards",
    {
        "rewards": fields.List(
            fields.Nested(proposals_rewards_model_item),
            required=True,
            description="Proposal rewards",
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
class EpochBudgets(OctantResource):
    representations = {
        "application/json": OctantResource.encode_json_response,
        "text/csv": OctantResource.encode_csv_response,
    }

    @ns.produces(["application/json", "text/csv"])
    @ns.marshal_with(epoch_budget_model)
    @ns.response(200, "Epoch individual budgets successfully retrieved")
    def get(self, epoch):
        headers = {}
        data = []

        if EpochBudgets.response_mimetype(request) == "text/csv":
            headers[
                "Content-Disposition"
            ] = f"attachment;filename=budgets_epoch_{epoch}.csv"

            # for csv header resoultion - in case of empty list,
            # endpoint marshalling will automatically create expected object with nulled fields
            data.append({})

        app.logger.debug(f"Get budgets for all users in epoch {epoch}")
        data += rewards.get_all_budgets(epoch)
        return data, 200, headers


@ns.route("/estimated_budget")
@ns.doc(
    description="Returns estimated rewards budget available when GLM locked by given period of time"
)
class EstimatedUserBudget(OctantResource):
    @ns.expect(estimated_budget_request)
    @ns.marshal_with(user_budget_model)
    @ns.response(200, "Budget successfully retrieved")
    def post(self):
        days, glm_amount = ns.payload["days"], int(ns.payload["glm_amount"])
        app.logger.debug(
            f"Getting user estimated budget for {days} days and {glm_amount} GLM"
        )
        budget = estimate_budget(days, glm_amount)
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
class Threshold(OctantResource):
    @ns.marshal_with(threshold_model)
    @ns.response(200, "Threshold successfully retrieved")
    def get(self, epoch):
        app.logger.debug(f"Getting threshold for epoch {epoch}")
        threshold = rewards.get_allocation_threshold(epoch)
        app.logger.debug(f"Threshold in epoch: {epoch}: {threshold}")

        return {"threshold": threshold}


@ns.doc(
    description="Returns proposals with matched rewards for a given epoch",
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
@ns.route("/proposals/epoch/<int:epoch>")
class FinalizedProposalsRewards(OctantResource):
    @ns.marshal_with(proposals_rewards_model)
    def get(self, epoch):
        app.logger.debug(f"Getting proposal rewards for a finalized epoch {epoch}")
        proposal_rewards = rewards.get_finalized_epoch_proposals_rewards(epoch)
        app.logger.debug(f"Proposal rewards in epoch: {epoch}: {proposal_rewards}")

        return {"rewards": proposal_rewards}


@ns.doc(
    description="Returns proposals with estimated matched rewards for the pending epoch"
)
@ns.response(
    200,
    "",
)
@ns.route("/proposals/estimated")
class EstimatedProposalsRewards(OctantResource):
    @ns.marshal_with(proposals_rewards_model)
    def get(self):
        app.logger.debug("Getting proposal rewards for the pending epoch")
        proposal_rewards = rewards.get_estimated_proposals_rewards()
        app.logger.debug(f"Proposal rewards in pending epoch: {proposal_rewards}")

        return {"rewards": proposal_rewards}


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

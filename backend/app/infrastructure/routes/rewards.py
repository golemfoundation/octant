import dataclasses

from flask import current_app
from flask_restx import Resource, Namespace, fields

from app.controllers import rewards
from app.core import user
from app.extensions import api
from app.settings import config

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

threshold_model = api.model(
    "Threshold",
    {
        "threshold": fields.String(
            required=True,
            description="Threshold, that projects have to pass to be eligible for receiving rewards",
        ),
    },
)

proposal_model = api.model(
    "Proposal",
    {
        "address": fields.String(
            required=True,
            description="Proposal address",
        ),
        "allocated": fields.String(
            required=True,
            description="User allocated funds for the proposal",
        ),
        "matched": fields.String(
            required=True,
            description="Matched rewards funds for the proposal",
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

if config.EPOCH_2_FEATURES_ENABLED:

    @ns.route("/budget/<string:user_address>/epoch/<int:epoch>")
    @ns.doc(
        description="Returns user's rewards budget available to allocate for given epoch",
        params={
            "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed "
            "with 0x)",
            "epoch": "Epoch number",
        },
    )
    class UserBudget(Resource):
        @ns.marshal_with(user_budget_model)
        @ns.response(200, "Budget successfully retrieved")
        def get(self, user_address, epoch):
            current_app.logger.info(
                f"Getting budget for user: {user_address} in epoch {epoch}"
            )
            budget = user.get_budget(user_address, epoch)
            return {"budget": budget}

    @ns.route("/threshold/<int:epoch>")
    @ns.doc(
        description="Returns allocation threshold for the projects to be eligible for rewards",
        params={
            "epoch": "Epoch number",
        },
    )
    @ns.response(200, "Returns allocation threshold value as uint256")
    class Threshold(Resource):
        @ns.marshal_with(threshold_model)
        @ns.response(200, "Threshold successfully retrieved")
        def get(self, epoch):
            current_app.logger.info(f"Requested threshold for epoch: {epoch}")
            threshold = rewards.get_allocation_threshold(epoch)
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
        "Invalid epoch number given. Has the allocation window "
        "for the given epoch started already?",
    )
    @ns.route("/proposals/epoch/<int:epoch>")
    class Proposals(Resource):
        @ns.marshal_with(proposal_model)
        def get(self, epoch):
            current_app.logger.info(f"Requested proposal rewards for: {epoch}")
            return [
                dataclasses.asdict(proposal)
                for proposal in rewards.get_proposals_rewards(epoch)
            ]

    @ns.doc(
        description="Returns total of allocated and budget for matched rewards for a given epoch",
        params={
            "epoch": "Epoch number",
        },
    )
    @ns.response(200, "")
    @ns.route("/budget/epoch/<int:epoch>")
    class Budget(Resource):
        @ns.marshal_with(budget_model)
        def get(self, epoch):
            budget = rewards.get_rewards_budget(epoch)
            return dataclasses.asdict(budget)

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
    class RewardsMerkleTree(Resource):
        @ns.marshal_with(epoch_rewards_merkle_tree_model)
        def get(self, epoch: int):
            current_app.logger.info(f"Requested merkle tree leaves for: {epoch}")
            merkle_tree_leaves = rewards.get_rewards_merkle_tree(epoch)
            return merkle_tree_leaves.to_dict()

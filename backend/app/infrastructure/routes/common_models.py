from flask_restx import fields

from app.extensions import api

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
        "leverage": fields.String(
            required=False,
            description="Leverage of the allocated funds, percents",
        ),
    },
)

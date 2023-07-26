import dataclasses

from flask_restx import Resource, Namespace, fields

from app.controllers import allocations
from app.extensions import api

ns = Namespace("allocations", description="Octant allocations")
api.add_namespace(ns)


user_allocations_model = api.model(
    "UserAllocations",
    {
        "address": fields.String(
            required=True,
            description="Proposal address",
        ),
        "amount": fields.String(
            required=True,
            description="Funds allocated by user for the proposal in WEI",
        ),
    },
)

user_allocations_sum_model = api.model(
    "UserAllocationsSum",
    {
        "amount": fields.String(
            required=True, description="User allocations sum in WEI"
        ),
    },
)


proposal_donors_model = api.model(
    "ProposalDonors",
    {
        "address": fields.String(
            required=True,
            description="Donor address",
        ),
        "amount": fields.String(
            required=True,
            description="Funds allocated by donor for the proposal in WEI",
        ),
    },
)


@ns.route("/user/<string:user_address>/epoch/<int:epoch>")
@ns.doc(
    description="Returns user's latest allocation in a particular epoch",
    params={
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)",
        "epoch": "Epoch number",
    },
)
class UserAllocations(Resource):
    @ns.marshal_with(user_allocations_model)
    @ns.response(200, "User allocations successfully retrieved")
    def get(self, user_address: str, epoch: int):
        return [
            dataclasses.asdict(w)
            for w in allocations.get_all_by_user_and_epoch(user_address, epoch)
        ]


@ns.route("/users/sum")
@ns.doc(
    description="Returns user's allocations sum",
)
class UserAllocationsSum(Resource):
    @ns.marshal_with(user_allocations_sum_model)
    @ns.response(200, "User allocations sum successfully retrieved")
    def get(self):
        allocations_sum = allocations.get_sum_by_epoch()
        return {"amount": str(allocations_sum)}


@ns.route("/proposal/<string:proposal_address>/epoch/<int:epoch>")
@ns.doc(
    description="Returns list of donors for given proposal in particular epoch",
    params={
        "proposal_address": "Proposal ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)",
        "epoch": "Epoch number",
    },
)
class ProposalDonors(Resource):
    @ns.marshal_with(proposal_donors_model)
    @ns.response(200, "Returns list of proposal donors")
    def get(self, proposal_address: str, epoch: int):
        return [
            dataclasses.asdict(w)
            for w in allocations.get_all_by_proposal_and_epoch(proposal_address, epoch)
        ]

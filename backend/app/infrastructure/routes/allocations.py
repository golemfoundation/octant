import dataclasses

from flask import current_app as app
from flask_restx import Namespace, fields

from app.controllers import allocations
from app.core.allocations import AllocationRequest
from app.extensions import api
from app.infrastructure import OctantResource
from app.infrastructure.routes.common_models import proposals_rewards_model

ns = Namespace("allocations", description="Octant allocations")
api.add_namespace(ns)

user_allocations_payload_item = api.model(
    "UserAllocationPayloadItem",
    {
        "proposalAddress": fields.String(
            required=True,
            description="Proposal address",
        ),
        "amount": fields.String(
            required=True,
            description="Funds allocated by user for the proposal in WEI",
        ),
    },
)

allocation_payload = api.model(
    "AllocationPayload",
    {
        "allocations": fields.List(
            fields.Nested(user_allocations_payload_item),
            description="User allocation payload",
        ),
        "nonce": fields.Integer(
            required=True, description="Allocation signature nonce"
        ),
    },
)

user_allocation_request = api.model(
    "UserAllocationRequest",
    {
        "payload": fields.Nested(allocation_payload),
        "signature": fields.String(
            required=True,
            description="EIP-712 signature of the allocation payload as a hexadecimal string",
        ),
    },
)


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


@ns.route("/allocate")
@ns.doc(description="Allocates user's funds to proposals")
class Allocation(OctantResource):
    @ns.expect(user_allocation_request)
    @ns.response(201, "User allocated successfully")
    def post(self):
        payload, signature = ns.payload["payload"], ns.payload["signature"]
        app.logger.info(f"User allocation payload: {payload}, signature: {signature}")
        user_address = allocations.allocate(
            AllocationRequest(payload, signature, override_existing_allocations=True)
        )
        app.logger.info(f"User: {user_address} allocated successfully")

        return {}, 201


@ns.route("/simulate/<string:user_address>")
@ns.doc(
    description="Simulates an allocation and get estimated proposal rewards",
    params={
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)",
    },
)
class AllocationSimulation(OctantResource):
    @ns.expect(allocation_payload)
    @ns.marshal_with(proposals_rewards_model)
    @ns.response(200, "User allocation successfully simulated")
    def post(self, user_address: str):
        app.logger.debug("Simulating an allocation")
        proposal_rewards = allocations.simulate_allocation(ns.payload, user_address)
        app.logger.debug(f"Simulated allocation rewards: {proposal_rewards}")

        return {"rewards": proposal_rewards}


@ns.route("/user/<string:user_address>/epoch/<int:epoch>")
@ns.doc(
    description="Returns user's latest allocation in a particular epoch",
    params={
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)",
        "epoch": "Epoch number",
    },
)
class UserAllocations(OctantResource):
    @ns.marshal_with(user_allocations_model)
    @ns.response(200, "User allocations successfully retrieved")
    def get(self, user_address: str, epoch: int):
        app.logger.debug(f"Getting user {user_address} allocation in epoch {epoch}")
        user_allocation = [
            dataclasses.asdict(w)
            for w in allocations.get_all_by_user_and_epoch(user_address, epoch)
        ]
        app.logger.debug(f"User {user_address} allocation: {user_allocation}")

        return user_allocation


@ns.route("/users/sum")
@ns.doc(
    description="Returns user's allocations sum",
)
class UserAllocationsSum(OctantResource):
    @ns.marshal_with(user_allocations_sum_model)
    @ns.response(200, "User allocations sum successfully retrieved")
    def get(self):
        app.logger.debug("Getting users allocations sum")
        allocations_sum = allocations.get_sum_by_epoch()
        app.logger.debug(f"Users allocations sum: {allocations_sum}")

        return {"amount": str(allocations_sum)}


@ns.route("/proposal/<string:proposal_address>/epoch/<int:epoch>")
@ns.doc(
    description="Returns list of donors for given proposal in particular epoch",
    params={
        "proposal_address": "Proposal ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)",
        "epoch": "Epoch number",
    },
)
class ProposalDonors(OctantResource):
    @ns.marshal_with(proposal_donors_model)
    @ns.response(200, "Returns list of proposal donors")
    def get(self, proposal_address: str, epoch: int):
        app.logger.debug(
            f"Getting donors for proposal {proposal_address} in epoch {epoch}"
        )
        donors = [
            dataclasses.asdict(w)
            for w in allocations.get_all_by_proposal_and_epoch(proposal_address, epoch)
        ]
        app.logger.debug(f"Proposal donors {donors}")

        return donors


allocation_nonce_model = api.model(
    "AllocationNonce",
    {
        "allocation_nonce": fields.Integer(
            required=True,
            description="Current value of nonce used to sign allocations message. Note: this has nothing to do with Ethereum account nonce!",
        ),
    },
)


@ns.route("/users/<string:user_address>/allocation_nonce")
@ns.doc(
    description="Return current value of allocation nonce. It is neeeded to sign allocations.",
)
class AllocationNonce(OctantResource):
    @ns.marshal_with(allocation_nonce_model)
    @ns.response(200, "User allocations nonce successfully retrieved")
    def get(self, user_address: str):
        return {"allocation_nonce": allocations.get_allocation_nonce(user_address)}

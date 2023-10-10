import dataclasses

from flask import current_app as app, request
from flask_restx import Namespace, fields

from app.controllers import allocations
from app.core.allocations import AllocationRequest
from app.extensions import api
from app.infrastructure import OctantResource

ns = Namespace("allocations", description="Octant allocations")
api.add_namespace(ns)

allocation_nonce_model = api.model(
    "AllocationNonce",
    {
        "allocationNonce": fields.Integer(
            required=True,
            description="Current value of nonce used to sign allocations message. Note: this has nothing to do with Ethereum account nonce!",
        ),
    },
)

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

allocation_nonce_model = api.model(
    "AllocationNonce",
    {
        "allocationNonce": fields.Integer(
            required=True,
            description="Current value of nonce used to sign allocations message. Note: this has nothing to do with Ethereum account nonce!",
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

leverage_payload = api.model(
    "LeveragePayload",
    {
        "allocations": fields.List(
            fields.Nested(user_allocations_payload_item),
            description="User allocation payload",
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
epoch_donations_model = api.model(
    "EpochDonations",
    {
        "donor": fields.String(
            required=True,
            description="Donor address",
        ),
        "amount": fields.String(
            required=True,
            description="Funds allocated by donor for the proposal in WEI",
        ),
        "proposal": fields.String(
            required=True,
            description="Proposal address",
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


user_leverage_model = api.model(
    "UserLeverage",
    {
        "leverage": fields.String(
            required=False,
            description="Leverage of the allocated funds",
        ),
    },
)


@ns.route("/leverage/<string:user_address>")
@ns.doc(
    description="Simulates an allocation and get the expected leverage",
    params={
        "user_address": "User ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)",
    },
)
class AllocationLeverage(OctantResource):
    @ns.expect(leverage_payload)
    @ns.marshal_with(user_leverage_model)
    @ns.response(200, "User leverage successfully estimated")
    def post(self, user_address: str):
        app.logger.debug("Estimating user leverage")
        leverage, proposal_rewards = allocations.simulate_allocation(
            ns.payload, user_address
        )
        app.logger.debug(f"Estimated leverage: {leverage}")

        return {"leverage": leverage}


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


@ns.route("/proposal/epoch/<int:epoch>")
@ns.doc(
    description="Returns list of donations in particular epoch",
    params={
        "epoch": "Epoch number",
    },
)
class EpochDonations(OctantResource):
    representations = {
        "application/json": OctantResource.encode_json_response,
        "text/csv": OctantResource.encode_csv_response,
    }

    @ns.produces(["application/json", "text/csv"])
    @ns.response(200, "Returns list of donations for given epoch")
    @ns.marshal_with(epoch_donations_model)
    def get(self, epoch: int):
        app.logger.debug(f"Getting donations in epoch {epoch}")

        headers = {}
        data = []

        if EpochDonations.response_mimetype(request) == "text/csv":
            headers[
                "Content-Disposition"
            ] = f"attachment;filename=donations_epoch_{epoch}.csv"

            # for csv header resoultion - in case of empty list,
            # endpoint marshalling will automatically create expected object with nulled fields
            data.append({})

        donations = [dataclasses.asdict(w) for w in allocations.get_all_by_epoch(epoch)]
        data += donations

        app.logger.debug(f"Donations for epoch {epoch}:  {donations}")

        return data, 200, headers


@ns.route("/users/<string:user_address>/allocation_nonce")
@ns.doc(
    description="Return current value of allocation nonce. It is needed to sign allocations.",
)
class AllocationNonce(OctantResource):
    @ns.marshal_with(allocation_nonce_model)
    @ns.response(200, "User allocations nonce successfully retrieved")
    def get(self, user_address: str):
        return {"allocationNonce": allocations.get_allocation_nonce(user_address)}

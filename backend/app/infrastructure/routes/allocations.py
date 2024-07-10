import dataclasses

from flask import current_app as app
from flask import request
from flask_restx import Namespace, fields

from app.extensions import api
from app.infrastructure import OctantResource
from app.modules.common import parse_bool
from app.modules.user.allocations import controller

ns = Namespace("allocations", description="Octant allocations")
api.add_namespace(ns)


user_allocations_payload_item = api.model(
    "UserAllocationPayloadItem",
    {
        "proposalAddress": fields.String(
            required=True,
            description="Project address",
        ),
        "amount": fields.String(
            required=True,
            description="Funds allocated by user for the project in WEI",
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
        "userAddress": fields.String(
            required=True,
            description="Wallet address of the user. EOA or EIP-1271",
        ),
        "signature": fields.String(
            required=True,
            description="EIP-712 signature of the allocation payload as a hexadecimal string",
        ),
        "isManuallyEdited": fields.Boolean(
            required=False,
            description="Whether allocation was manually edited by user.",
        ),
    },
)

user_allocation_item = api.model(
    "UserAllocationItem",
    {
        "address": fields.String(
            required=True,
            description="Project address",
        ),
        "amount": fields.String(
            required=True,
            description="Funds allocated by user for the project in WEI",
        ),
    },
)

user_allocations_model = api.model(
    "UserAllocations",
    {
        "allocations": fields.List(
            fields.Nested(user_allocation_item),
            description="User allocation item",
        ),
        "isManuallyEdited": fields.Boolean(
            required=False,
            description="Whether allocation was manually edited by user.",
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

project_donors_model = api.model(
    "ProjectDonors",
    {
        "address": fields.String(
            required=True,
            description="Donor address",
        ),
        "amount": fields.String(
            required=True,
            description="Funds allocated by donor for the project in WEI",
        ),
    },
)

donors_model = api.model(
    "Donors",
    {"donors": fields.List(fields.String, required=True, description="Donors address")},
)

allocation_item = api.model(
    "EpochAllocation",
    {
        "donor": fields.String(
            required=True,
            description="Donor address",
        ),
        "amount": fields.String(
            required=True,
            description="Funds allocated by donor for the project in WEI",
        ),
        "project": fields.String(
            required=True,
            description="Project address",
        ),
    },
)

epoch_allocations_model = api.model(
    "AllocationsModel",
    {
        "allocations": fields.List(
            fields.Nested(allocation_item, required=True, description="Allocation")
        )
    },
)


@ns.route("/allocate")
@ns.doc(description="Allocates user's funds to projects")
class Allocation(OctantResource):
    @ns.expect(user_allocation_request)
    @ns.response(201, "User allocated successfully")
    def post(self):
        app.logger.info(f"User allocation: {ns.payload}")
        is_manually_edited = (
            ns.payload["isManuallyEdited"] if "isManuallyEdited" in ns.payload else None
        )
        controller.allocate(
            ns.payload["userAddress"], ns.payload, is_manually_edited=is_manually_edited
        )
        app.logger.info(f"User: {ns.payload['userAddress']} allocated successfully")

        return {}, 201


matched_reward = api.model(
    "Project",
    {
        "address": fields.String(
            required=True,
            description="Project address",
        ),
        "value": fields.String(
            required=True,
            description="Matched rewards funds for the project, wei",
        ),
    },
)

user_leverage_model = api.model(
    "UserLeverage",
    {
        "leverage": fields.String(
            required=True,
            description="Leverage of the allocated funds",
        ),
        "threshold": fields.String(
            required=True,
            description="Simulated threshold, above which projects get funded.",
        ),
        "matched": fields.List(
            fields.Nested(matched_reward),
            required=True,
            description="List of matched rewards for each project",
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
        leverage, threshold, matched = controller.simulate_allocation(
            ns.payload, user_address
        )
        app.logger.debug(f"Estimated leverage: {leverage}")
        app.logger.debug(f"Estimated threshold: {threshold}")
        app.logger.debug(f"Matched rewards:  {matched}")

        return {"leverage": leverage, "threshold": threshold, "matched": matched}


@ns.route("/epoch/<int:epoch>")
@ns.doc(
    description="Returns all latest allocations in a particular epoch",
    params={
        "epoch": "Epoch number",
    },
)
class EpochAllocations(OctantResource):
    @ns.param(
        "includeZeroAllocations",
        description="Include zero allocations to projects. Defaults to false.",
        _in="query",
    )
    @ns.marshal_with(epoch_allocations_model)
    @ns.response(200, "Epoch allocations successfully retrieved")
    def get(self, epoch: int):
        include_zero_allocations = request.args.get(
            "includeZeroAllocations", default=False, type=parse_bool
        )
        app.logger.debug(f"Getting latest allocations in epoch {epoch}")
        allocs = controller.get_all_allocations(epoch, include_zero_allocations)
        app.logger.debug(
            f"Allocations for epoch {epoch} (with zero allocations: {include_zero_allocations}): {allocs}"
        )

        return {"allocations": allocs}


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
        (
            allocs,
            is_manually_edited,
        ) = controller.get_last_user_allocation(user_address, epoch)

        user_allocations = [dataclasses.asdict(w) for w in allocs]
        app.logger.debug(
            f"User {user_address} allocation (manually edited: {is_manually_edited}): {user_allocations}"
        )

        return {
            "allocations": user_allocations,
            "isManuallyEdited": is_manually_edited,
        }


@ns.route("/project/<string:project_address>/epoch/<int:epoch>")
@ns.doc(
    description="Returns list of donors for given project in particular epoch",
    params={
        "project_address": "Project ethereum address in hexadecimal format (case-insensitive, prefixed with 0x)",
        "epoch": "Epoch number",
    },
)
class ProjectDonors(OctantResource):
    @ns.marshal_with(project_donors_model)
    @ns.response(200, "Returns list of project donors")
    def get(self, project_address: str, epoch: int):
        app.logger.debug(
            f"Getting donors for project {project_address} in epoch {epoch}"
        )
        donors = [
            {"address": w.donor, "amount": w.amount}
            for w in controller.get_all_donations_by_project(project_address, epoch)
        ]
        app.logger.debug(f"Project donors {donors}")

        return donors


@ns.route("/users/<string:user_address>/allocation_nonce")
@ns.doc(
    description="Return current value of allocation nonce. It is needed to sign allocations.",
)
class AllocationNonce(OctantResource):
    @ns.marshal_with(allocation_nonce_model)
    @ns.response(200, "User allocations nonce successfully retrieved")
    def get(self, user_address: str):
        return {"allocationNonce": controller.get_user_next_nonce(user_address)}


@ns.route("/donors/<int:epoch>")
class Donors(OctantResource):
    @ns.doc(
        description="Returns donors addresses",
        params={
            "epoch": "Epoch number",
        },
    )
    @ns.marshal_with(donors_model)
    @ns.response(200, "Donors addresses retrieved")
    def get(self, epoch: int):
        app.logger.debug(f"Getting donors addresses for epoch {epoch}")
        donors = controller.get_donors(epoch)
        app.logger.debug(f"Donors addresses: {donors}")

        return {"donors": donors}

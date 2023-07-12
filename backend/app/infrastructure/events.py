import json
from typing import List

from flask import current_app
from flask_socketio import emit

from app.controllers import allocations
from app.controllers.rewards import (
    get_allocation_threshold,
    get_proposals_rewards,
    ProposalReward,
)
from app.core.allocations import allocate, AllocationRequest
from app.core.common import AccountFunds
from app.exceptions import print_stacktrace, UNEXPECTED_EXCEPTION, OctantException
from app.extensions import socketio


@socketio.on("connect")
def handle_connect():
    current_app.logger.info("Client connected")
    threshold = get_allocation_threshold()
    emit("threshold", json.dumps({"threshold": str(threshold)}))
    proposal_rewards = get_proposals_rewards()
    emit("proposal_rewards", json.dumps(_serialize_proposal_rewards(proposal_rewards)))


@socketio.on("disconnect")
def handle_disconnect():
    current_app.logger.info("Client disconnected")


@socketio.on("allocate")
def handle_allocate(msg):
    msg = json.loads(msg)
    payload, signature = msg["payload"], msg["signature"]
    current_app.logger.info(
        f"User allocation: payload: {payload}, signature: {signature}"
    )
    allocate(AllocationRequest(payload, signature, override_existing_allocations=True))

    threshold = get_allocation_threshold()
    emit("threshold", json.dumps({"threshold": str(threshold)}), broadcast=True)
    allocations_sum = allocations.get_sum_by_epoch()
    emit(
        "allocations_sum", json.dumps({"amount": str(allocations_sum)}), broadcast=True
    )

    proposal_rewards = get_proposals_rewards()
    emit(
        "proposal_rewards",
        json.dumps(_serialize_proposal_rewards(proposal_rewards)),
        broadcast=True,
    )
    for proposal in proposal_rewards:
        donors = allocations.get_all_by_proposal_and_epoch(proposal.address)
        emit("proposal_donors", json.dumps(_serialize_donors(donors)), broadcast=True)


@socketio.on("proposal_donors")
def handle_proposal_donors(proposal_address: str):
    donors = allocations.get_all_by_proposal_and_epoch(proposal_address)
    emit("proposal_donors", json.dumps(_serialize_donors(donors)))




@socketio.on_error_default
def default_error_handler(e):
    print_stacktrace()
    if isinstance(e, OctantException):
        emit("exception", json.dumps({"message": str(e.message)}))
    else:
        emit("exception", json.dumps({"message": UNEXPECTED_EXCEPTION}))


def _serialize_proposal_rewards(proposal_rewards: List[ProposalReward]) -> List[dict]:
    return [
        {
            "address": proposal.address,
            "allocated": str(proposal.allocated),
            "matched": str(proposal.matched),
        }
        for proposal in proposal_rewards
    ]


def _serialize_donors(donors: List[AccountFunds]) -> List[dict]:
    return [
        {
            "address": donor.address,
            "amount": str(donor.amount),
        }
        for donor in donors
    ]

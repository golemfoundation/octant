import json
from typing import List

from flask import current_app as app
from flask_socketio import emit

from app.controllers import allocations
from app.controllers.allocations import allocate
from app.controllers.rewards import (
    get_allocation_threshold,
    get_estimated_proposals_rewards,
    ProposalReward,
)
from app.core.allocations import AllocationRequest
from app.core.common import AccountFunds
from app.exceptions import OctantException
from app.extensions import socketio
from app.infrastructure.exception_handler import UNEXPECTED_EXCEPTION, ExceptionHandler


@socketio.on("connect")
def handle_connect():
    app.logger.debug("Client connected")
    threshold = get_allocation_threshold()
    emit("threshold", {"threshold": str(threshold)})
    proposal_rewards = get_estimated_proposals_rewards()
    emit("proposal_rewards", _serialize_proposal_rewards(proposal_rewards))


@socketio.on("disconnect")
def handle_disconnect():
    app.logger.debug("Client disconnected")


@socketio.on("allocate")
def handle_allocate(msg):
    msg = json.loads(msg)
    payload, signature = msg["payload"], msg["signature"]
    app.logger.info(f"User allocation payload: {payload}, signature: {signature}")
    user_address = allocate(
        AllocationRequest(payload, signature, override_existing_allocations=True)
    )
    app.logger.info(f"User: {user_address} allocated successfully")

    threshold = get_allocation_threshold()
    emit("threshold", {"threshold": str(threshold)}, broadcast=True)
    allocations_sum = allocations.get_sum_by_epoch()
    emit("allocations_sum", {"amount": str(allocations_sum)}, broadcast=True)

    proposal_rewards = get_estimated_proposals_rewards()
    emit(
        "proposal_rewards",
        _serialize_proposal_rewards(proposal_rewards),
        broadcast=True,
    )
    for proposal in proposal_rewards:
        donors = allocations.get_all_by_proposal_and_epoch(proposal.address)
        emit("proposal_donors", _serialize_donors(donors), broadcast=True)


@socketio.on("proposal_donors")
def handle_proposal_donors(proposal_address: str):
    donors = allocations.get_all_by_proposal_and_epoch(proposal_address)
    emit("proposal_donors", _serialize_donors(donors))


@socketio.on_error_default
def default_error_handler(e):
    ExceptionHandler.print_stacktrace(e)
    if isinstance(e, OctantException):
        emit("exception", {"message": str(e.message)})
    else:
        emit("exception", {"message": UNEXPECTED_EXCEPTION})


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

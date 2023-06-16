import json
from typing import List

from flask import current_app
from flask_socketio import emit

from app.controllers.rewards import (
    get_allocation_threshold,
    get_proposals_rewards,
    ProposalReward,
)
from app.core.allocations import allocate
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
    allocate(payload, signature)

    threshold = get_allocation_threshold()
    emit("threshold", json.dumps({"threshold": str(threshold)}), broadcast=True)
    proposal_rewards = get_proposals_rewards()
    emit(
        "proposal_rewards",
        json.dumps(_serialize_proposal_rewards(proposal_rewards)),
        broadcast=True,
    )


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

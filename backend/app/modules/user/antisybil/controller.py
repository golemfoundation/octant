import datetime
import time
from typing import List

from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.modules.registry import get_services
from app.infrastructure.external_api.gc_passport.score import (
    issue_address_for_scoring,
    fetch_score,
    fetch_stamps,
)


def get_user_antisybil_status(user_address: str) -> (int, datetime):
    context = state_context(EpochState.CURRENT)
    service = get_services(context.epoch_state).user_antisybil_service
    return service.get_antisybil_status(context, user_address)


def update_user_antisybil_status(user_address: str) -> int:
    context = state_context(EpochState.CURRENT)
    service = get_services(context.epoch_state).user_antisybil_service

    score = issue_address_for_scoring(user_address)

    while score["status"] != "DONE":
        print("Waiting for score for user {user_address}")
        time.sleep(3)
        score = fetch_score(user_address)

    all_stamps = fetch_stamps(user_address)["items"]
    cutoff = datetime.datetime.now()
    valid_stamps = _filter_older(cutoff, all_stamps)
    expires_at = datetime.datetime.now()
    if len(valid_stamps) != 0:
        expires_at = _parse_expirationDate(
            min([stamp["credential"]["expirationDate"] for stamp in valid_stamps])
        )
    service.update_antisybil_status(
        context, user_address, score["score"], expires_at, all_stamps
    )
    return score, expires_at


def _parse_expirationDate(timestamp_str):
    # API returns expirationDate in both formats
    formats = ["%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ"]
    last_error = None
    for format_str in formats:
        try:
            return datetime.datetime.strptime(timestamp_str, format_str)
        except ValueError as e:
            last_error = e
    raise last_error


def _filter_older(cutoff, stamps: List[dict()]) -> List[dict()]:
    notExpired = (
        lambda stamp: _parse_expirationDate(stamp["credential"]["expirationDate"])
        < cutoff
    )
    return list(filter(notExpired, stamps))

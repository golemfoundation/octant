from datetime import datetime
from typing import List, Optional, Tuple

from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.modules.registry import get_services


def get_user_antisybil_status(
    user_address: str,
) -> Optional[Tuple[Tuple[int, datetime], Tuple[bool, List[str]]]]:
    context = state_context(EpochState.CURRENT)
    passport = get_services(context.epoch_state).user_antisybil_passport_service
    passport_status = passport.get_antisybil_status(context, user_address)
    holonym = get_services(context.epoch_state).user_antisybil_holonym_service
    holonym_status = holonym.get_sbt_status(context, user_address)
    if passport_status is None or holonym_status is None:
        return None

    return (passport_status, holonym_status)


def update_user_antisybil_status(
    user_address: str,
) -> Tuple[Tuple[int, datetime], Tuple[bool, List[str]]]:
    context = state_context(EpochState.CURRENT)
    passport = get_services(context.epoch_state).user_antisybil_passport_service

    score, expires_at, all_stamps = passport.fetch_antisybil_status(
        context, user_address
    )
    passport.update_antisybil_status(
        context, user_address, score, expires_at, all_stamps
    )

    holonym = get_services(context.epoch_state).user_antisybil_holonym_service

    has_sbt, cred_type = holonym.fetch_sbt_status(context, user_address)
    holonym.update_sbt_status(context, user_address, has_sbt, cred_type)

    return ((score, expires_at), (has_sbt, cred_type))

from typing import Optional, Tuple

from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.modules.registry import get_services
from app.modules.user.antisybil.service.holonym import HolonymAntisybilDTO
from app.modules.user.antisybil.service.passport import GitcoinAntisybilDTO


def get_user_antisybil_status(
    user_address: str,
) -> Tuple[Optional[GitcoinAntisybilDTO], Optional[HolonymAntisybilDTO]]:
    context = state_context(EpochState.CURRENT)
    passport = get_services(context.epoch_state).user_antisybil_passport_service
    gpscore = passport.get_antisybil_status(context, user_address)
    holonym = get_services(context.epoch_state).user_antisybil_holonym_service
    sbt = holonym.get_sbt_status(context, user_address)
    return (gpscore, sbt)


def update_user_antisybil_status(
    user_address: str,
) -> Tuple[GitcoinAntisybilDTO, HolonymAntisybilDTO]:
    context = state_context(EpochState.CURRENT)
    passport = get_services(context.epoch_state).user_antisybil_passport_service

    gpscore, stamps = passport.fetch_antisybil_status(context, user_address)
    passport.update_antisybil_status(
        context, user_address, gpscore.score, gpscore.expires_at, stamps
    )

    holonym = get_services(context.epoch_state).user_antisybil_holonym_service

    sbt = holonym.fetch_sbt_status(context, user_address)
    holonym.update_sbt_status(context, user_address, sbt.has_sbt, sbt.sbt_details)

    return (gpscore, sbt)

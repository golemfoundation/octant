import json
from typing import Optional

from app.modules.user.antisybil.dto import AntisybilStatusDTO
from app.constants import (
    GUEST_LIST,
    GUEST_LIST_STAMP_PROVIDERS,
    GTC_STAKING_STAMP_PROVIDERS_AND_SCORES,
)
from app.infrastructure.database.models import GPStamps


def determine_antisybil_score(
    score: GPStamps, user_address: str, timeout_list: set
) -> Optional[AntisybilStatusDTO]:
    """
    Determine the antisybil score for a user.
    1. Timeout list users will always have a score of 0.0 and has a higher priority than guest list users.
    2. Guest list users will have a score increased by 21.0 if they have not been stamped by a guest list provider.
    3. If user has any stamps related to GTC staking, scores of those stamps are subtracted.
    """
    if score is None:
        return None

    potential_score = _apply_gtc_staking_stamp_nullification(score.score, score)

    if user_address.lower() in timeout_list:
        return AntisybilStatusDTO(
            score=0.0, expires_at=score.expires_at, is_on_timeout_list=True
        )
    elif user_address.lower() in GUEST_LIST and not _has_guest_stamp_applied_by_gp(
        score
    ):
        return AntisybilStatusDTO(
            score=potential_score + 21.0,
            expires_at=score.expires_at,
            is_on_timeout_list=False,
        )

    return AntisybilStatusDTO(
        score=potential_score, expires_at=score.expires_at, is_on_timeout_list=False
    )


def _get_provider(stamp) -> str:
    return stamp["credential"]["credentialSubject"]["provider"]


def _has_guest_stamp_applied_by_gp(score: GPStamps) -> bool:
    all_stamps = json.loads(score.stamps)
    stamps = [
        stamp
        for stamp in all_stamps
        if _get_provider(stamp) in GUEST_LIST_STAMP_PROVIDERS
    ]
    return len(stamps) > 0


def _apply_gtc_staking_stamp_nullification(score: int, stamps: GPStamps) -> int:
    """Take score and stamps as returned by Passport and remove score associated with GTC staking"""

    delta = 0
    all_stamps = json.loads(stamps.stamps)
    providers = [_get_provider(stamp) for stamp in all_stamps]
    for provider in providers:
        if provider in GTC_STAKING_STAMP_PROVIDERS_AND_SCORES.keys():
            delta = delta + GTC_STAKING_STAMP_PROVIDERS_AND_SCORES[provider]
    return score - delta

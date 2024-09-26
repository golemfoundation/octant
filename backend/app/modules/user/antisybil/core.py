import json
from typing import Optional

from app.modules.user.antisybil.dto import AntisybilStatusDTO
from app.constants import TIMEOUT_LIST, GUEST_LIST, GUEST_LIST_STAMP_PROVIDERS
from app.infrastructure.database.models import GPStamps


def determine_antisybil_score(
    score: GPStamps, user_address: str
) -> Optional[AntisybilStatusDTO]:
    """
    Determine the antisybil score for a user.
    Timeout list users will always have a score of 0.0 and has a higher priority than guest list users.
    Guest list users will have a score increased by 21.0 if they have not been stamped by a guest list provider.
    """
    if score is None:
        return None

    if user_address in TIMEOUT_LIST:
        return AntisybilStatusDTO(
            score=0.0, expires_at=score.expires_at, is_on_timeout_list=True
        )
    elif user_address in GUEST_LIST and not _has_guest_stamp_applied_by_gp(score):
        return AntisybilStatusDTO(
            score=score.score + 21.0,
            expires_at=score.expires_at,
            is_on_timeout_list=False,
        )

    return AntisybilStatusDTO(
        score=score.score, expires_at=score.expires_at, is_on_timeout_list=False
    )


def _has_guest_stamp_applied_by_gp(score: GPStamps) -> bool:
    def get_provider(stamp) -> str:
        return stamp["credential"]["credentialSubject"]["provider"]

    all_stamps = json.loads(score.stamps)
    stamps = [
        stamp
        for stamp in all_stamps
        if get_provider(stamp) in GUEST_LIST_STAMP_PROVIDERS
    ]
    return len(stamps) > 0

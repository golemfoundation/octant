from decimal import Decimal
from typing import List, Tuple

from app.constants import LOW_UQ_SCORE, MAX_UQ_SCORE, NULLIFIED_UQ_SCORE
from app.infrastructure.database.uniqueness_quotient import get_all_uqs_by_epoch


def calculate_uq(
    gp_score: float, uq_threshold: int, *, is_on_timeout_list: bool = False
) -> Decimal:
    if is_on_timeout_list is True:
        return NULLIFIED_UQ_SCORE

    if gp_score >= uq_threshold:
        return MAX_UQ_SCORE

    return LOW_UQ_SCORE


def get_all_uqs(epoch_num: int) -> List[Tuple[str, Decimal]]:
    all_uqs = get_all_uqs_by_epoch(epoch_num)
    return [(uq.user.address, uq.validated_score) for uq in all_uqs]

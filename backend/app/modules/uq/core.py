from dataclasses import dataclass
from decimal import Decimal

from app.constants import LOW_UQ_SCORE, MAX_UQ_SCORE


@dataclass
class Scores:
    identity_call: int = 10
    epoch0_poap: int = 10
    num_of_donations: int = 10
    threshold: int = 20
    min_return: Decimal = LOW_UQ_SCORE
    max_return: Decimal = MAX_UQ_SCORE


def calculate_uq(
    has_epoch_zero_poap: bool,
    passed_identity_call: bool,
    num_of_donations: int,
    gp_score: float,
    scores: Scores,
) -> Decimal:
    uq_score = 0

    if passed_identity_call:
        uq_score += scores.identity_call
    if num_of_donations > 1:
        uq_score += scores.num_of_donations
    if has_epoch_zero_poap:
        uq_score += scores.epoch0_poap

    total_uq_score = gp_score + uq_score
    if total_uq_score >= scores.threshold:
        return scores.max_return
    else:
        return scores.min_return

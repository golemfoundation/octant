from decimal import Decimal

from app.constants import UQ_THRESHOLD, LOW_UQ_SCORE, MAX_UQ_SCORE


def calculate_uq(
    has_epoch_zero_poap: bool,
    gp_score: float,
) -> Decimal:
    if gp_score >= UQ_THRESHOLD or has_epoch_zero_poap:
        return MAX_UQ_SCORE
    else:
        return LOW_UQ_SCORE

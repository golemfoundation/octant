from decimal import Decimal

from app.constants import LOW_UQ_SCORE, MAX_UQ_SCORE


def calculate_uq(gp_score: float, uq_threshold: int) -> Decimal:
    if gp_score >= uq_threshold:
        return MAX_UQ_SCORE

    return LOW_UQ_SCORE

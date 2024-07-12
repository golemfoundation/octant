from decimal import Decimal

from app.constants import UQ_THRESHOLD, LOW_UQ_SCORE, MAX_UQ_SCORE


def calculate_uq(gp_score: float) -> Decimal:
    if gp_score >= UQ_THRESHOLD:
        return MAX_UQ_SCORE

    return LOW_UQ_SCORE

from decimal import Decimal

from app.constants import UQ_THRESHOLD, LOW_UQ_SCORE, MAX_UQ_SCORE


def calculate_uq(
    gp_score: float, budget: int, user_address: str, addresses: list[str]
) -> Decimal:
    if gp_score >= UQ_THRESHOLD:
        return MAX_UQ_SCORE
    if budget > 0 and user_address not in addresses:
        return MAX_UQ_SCORE
    else:
        return LOW_UQ_SCORE

from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from v2.gitcoin_passport.services import get_gitcoin_passport_score

from .repositories import get_uq_score_by_user_address, save_uq_score_for_user_address

LOW_UQ_SCORE = Decimal("0.2")
MAX_UQ_SCORE = Decimal("1.0")


def calculate_uq_score(
    gp_score: float,
    uq_score_threshold: float,
    max_uq_score: Decimal = MAX_UQ_SCORE,
    low_uq_score: Decimal = LOW_UQ_SCORE,
) -> Decimal:
    """Calculate UQ score (multiplier) based on the GP score and the UQ score threshold.
    If the GP score is greater than or equal to the UQ score threshold, the UQ score is set to the maximum UQ score.
    Otherwise, the UQ score is set to the low UQ score.

    Args:
        gp_score (float): The GitcoinPassport antisybil score.
        uq_score_threshold (int): Anything below this threshold will be considered low UQ score, and anything above will be considered maximum UQ score.
    """

    if gp_score >= uq_score_threshold:
        return max_uq_score

    return low_uq_score


async def get_or_calculate_uq_score(
    session: AsyncSession,
    user_address: str,
    epoch_number: int,
    uq_score_threshold: float,
    max_uq_score: Decimal = MAX_UQ_SCORE,
    low_uq_score: Decimal = LOW_UQ_SCORE,
) -> Decimal:
    """Get or calculate the UQ score for a user in a given epoch.
    If the UQ score is already calculated, it will be returned.
    Otherwise, it will be calculated based on the Gitcoin Passport score and saved for future reference.
    """

    # Check if the UQ score is already calculated and saved
    uq_score = await get_uq_score_by_user_address(session, user_address, epoch_number)
    if uq_score:
        return uq_score

    # Otherwise, calculate the UQ score based on the gitcoin passport score
    gp_score = await get_gitcoin_passport_score(session, user_address)
    uq_score = calculate_uq_score(
        gp_score, uq_score_threshold, max_uq_score, low_uq_score
    )

    # and save the UQ score for future reference
    await save_uq_score_for_user_address(session, user_address, epoch_number, uq_score)

    return uq_score

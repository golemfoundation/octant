from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import GUEST_LIST
from app.modules.user.antisybil.service.initial import _has_guest_stamp_applied_by_gp
from eth_utils import to_checksum_address

from .repositories import (
    get_uq_score_by_user_address,
    save_uq_score_for_user_address,
    get_gp_stamps_by_address,
)


@dataclass
class UQScoreGetter:
    session: AsyncSession
    uq_score_threshold: float
    max_uq_score: Decimal
    low_uq_score: Decimal

    async def get_or_calculate(self, epoch_number: int, user_address: str) -> Decimal:
        return await get_or_calculate_uq_score(
            session=self.session,
            user_address=user_address,
            epoch_number=epoch_number,
            uq_score_threshold=self.uq_score_threshold,
            max_uq_score=self.max_uq_score,
            low_uq_score=self.low_uq_score,
        )


def calculate_uq_score(
    gp_score: float,
    uq_score_threshold: float,
    max_uq_score: Decimal,
    low_uq_score: Decimal,
) -> Decimal:
    """Calculate UQ score (multiplier) based on the GP score and the UQ score threshold.
    If the GP score is greater than or equal to the UQ score threshold, the UQ score is set to the maximum UQ score.
    Otherwise, the UQ score is set to the low UQ score.

    Args:
        gp_score (float): The GitcoinPassport antisybil score.
        uq_score_threshold (int): Anything below this threshold will be considered low UQ score, and anything above will be considered maximum UQ score.
        max_uq_score (Decimal): Score to be returned if the GP score is greater than or equal to the UQ score threshold.
        low_uq_score (Decimal): Score to be returned if the GP score is less than the UQ score threshold.
    """

    if gp_score >= uq_score_threshold:
        return max_uq_score

    return low_uq_score


async def get_or_calculate_uq_score(
    session: AsyncSession,
    user_address: str,
    epoch_number: int,
    uq_score_threshold: float,
    max_uq_score: Decimal,
    low_uq_score: Decimal,
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


async def get_gitcoin_passport_score(session: AsyncSession, user_address: str) -> float:
    """Gets saved Gitcoin Passport score for a user.
    Returns None if the score is not saved.
    If the user is in the GUEST_LIST, the score will be adjusted to include the guest stamp.
    """

    user_address = to_checksum_address(user_address)

    stamps = await get_gp_stamps_by_address(session, user_address)

    if stamps is None:
        return 0.0

    if user_address in GUEST_LIST and not _has_guest_stamp_applied_by_gp(stamps):
        return stamps.score + 21.0

    return stamps.score

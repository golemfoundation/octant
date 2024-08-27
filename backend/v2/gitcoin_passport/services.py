from app.constants import GUEST_LIST
from app.modules.user.antisybil.service.initial import _has_guest_stamp_applied_by_gp
from eth_utils import to_checksum_address
from sqlalchemy.ext.asyncio import AsyncSession

from .repositories import get_gp_stamps_by_address


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

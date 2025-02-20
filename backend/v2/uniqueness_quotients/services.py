from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal

from app.modules.user.antisybil.core import (
    _apply_gtc_staking_stamp_nullification,
    _has_guest_stamp_applied_by_gp,
)
from eth_utils import to_checksum_address
from sqlalchemy.ext.asyncio import AsyncSession
from v2.core.types import Address
from v2.uniqueness_quotients.repositories import (
    get_gp_stamps_by_address,
    get_uq_score_by_user_address,
    save_uq_score_for_user_address,
)


@dataclass
class UQScoreGetter:
    session: AsyncSession
    uq_score_threshold: float
    max_uq_score: Decimal
    low_uq_score: Decimal
    null_uq_score: Decimal
    guest_list: set[Address]
    timeout_list: set[Address]

    async def get_or_calculate(
        self, epoch_number: int, user_address: Address, *, should_save: bool
    ) -> Decimal:
        """Get or calculate the UQ score for a user in a given epoch.
        If the UQ score is already calculated, it will be returned.
        Otherwise, it will be calculated based on the Gitcoin Passport score and saved for future reference.
        """

        # Check if the UQ score is already calculated and saved
        uq_score = await get_uq_score_by_user_address(
            self.session, user_address, epoch_number
        )
        if uq_score:
            return uq_score

        # Otherwise, calculate the UQ score
        uq_score = await self.calculate_uq_score(user_address)

        if should_save:
            # Save the UQ score for future reference
            await save_uq_score_for_user_address(
                self.session, user_address, epoch_number, uq_score
            )

        return uq_score

    async def calculate_uq_score(self, user_address: Address) -> Decimal:
        gp_score = await self.get_gitcoin_passport_score(user_address)

        if user_address in self.timeout_list:
            return self.null_uq_score

        if gp_score >= self.uq_score_threshold:
            return self.max_uq_score

        return self.low_uq_score

    async def get_gitcoin_passport_score(self, user_address: Address) -> float:
        """Gets saved Gitcoin Passport score for a user.
        Returns None if the score is not saved.
        If the user is in the GUEST_LIST, the score will be adjusted to include the guest stamp.
        """

        user_address = to_checksum_address(user_address)
        stamps = await get_gp_stamps_by_address(self.session, user_address)

        # We have no information about the user's score
        if stamps is None:
            if user_address in self.guest_list:
                return 21.0
            return 0.0

        if user_address in self.timeout_list:
            return 0.0

        # We calculate expiration relative to the current time
        now = datetime.now(timezone.utc)

        # We remove score associated with GTC staking
        potential_score = _apply_gtc_staking_stamp_nullification(
            stamps.score, stamps, now
        )

        # If the user is in the guest list and has not been stamped by a guest list provider, increase the score by 21.0
        if user_address in self.guest_list and not _has_guest_stamp_applied_by_gp(
            stamps, now
        ):
            return potential_score + 21.0

        return potential_score

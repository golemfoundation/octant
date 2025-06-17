"""
Uniqueness Quotient (UQ) score calculation and management services.

This module provides services for calculating and managing user uniqueness scores,
which are used to prevent sybil attacks and ensure fair reward distribution.

Key Concepts:
    - UQ Score:
        - Measures user uniqueness
        - Based on Gitcoin Passport score
        - Three possible values:
            - max_uq_score (1.0): For users with high Gitcoin Passport scores (>15)
            - low_uq_score (0.01): For users with low Gitcoin Passport scores
            - null_uq_score (0.0): For users in timeout list
        - Then they are used in matched rewards calculation:
            - Higher UQ scores result in higher matched rewards
            - Full matching (1.0) gives maximum rewards (1:1)
            - Low matching (0.01) gives minimal rewards (0.01:1)
            - No matching (0.0) gives no rewards (for people on timeout list)

    - Gitcoin Passport:
        - External identity verification system
        - Provides stamps (verifications) for different attributes
        - Score calculated from valid stamps
        - Guest list provides additional verification
        - Note: Passport score is different from UQ score:
            - Passport score is raw score from Gitcoin (0-100)
            - UQ score is normalized to 0.0, 0.001, or 1.0
            - Used to determine reward matching eligibility

    - Score Calculation:
        - Base score from Gitcoin Passport
        - Guest list adjustments
        - Timeout list nullification
        - GTC staking stamp handling
        - Score threshold comparison
        - Normalization to UQ score values

    - Special Lists:
        - Guest List: Users with additional verification
        - Timeout List: Users with nullified scores
        - Both lists are maintained externally
"""

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
    """
    Service for retrieving and calculating UQ scores for users.

    This class handles the logic for determining a user's uniqueness score,
    including caching, calculation, and special case handling.
    The calculated UQ score is used in matched rewards calculation to determine
    the user's reward eligibility and multiplier.

    Attributes:
        session: Database session for persistence
        uq_score_threshold: Minimum Gitcoin Passport score for max UQ score (typically 15)
        max_uq_score: Highest possible UQ score (1.0)
        low_uq_score: UQ score for users below threshold (0.001)
        null_uq_score: UQ score for users in timeout list (0.0)
        guest_list: Set of addresses with guest verification
        timeout_list: Set of addresses with nullified scores
    """

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
        """
        Get or calculate the UQ score for a user in a given epoch.

        This method first checks if a score is already calculated and saved.
        If not, it calculates a new score and optionally saves it.

        Args:
            epoch_number: The epoch to get/calculate the score for
            user_address: The user's Ethereum address
            should_save: Whether to save the calculated score

        Returns:
            Decimal: The user's UQ score

        Note:
            - Scores are cached per epoch
            - Calculation is based on Gitcoin Passport
            - Special lists can override the score
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
        """
        Calculate the UQ score for a user based on their Gitcoin Passport score.

        The calculation follows these rules:
        1. If user is in timeout list, return null_uq_score (0.0)
        2. If Gitcoin Passport score >= threshold (15), return max_uq_score (1.0)
        3. Otherwise, return low_uq_score (0.01)

        The resulting UQ score is used in matched rewards calculation:
        - 1.0: Full matching, maximum rewards
        - 0.01: Low matching, minimal rewards
        - 0.0: No matching, no rewards

        Args:
            user_address: The user's Ethereum address

        Returns:
            Decimal: The calculated UQ score (0.0, 0.001, or 1.0)

        Note:
            - Timeout list takes precedence
            - Threshold comparison is inclusive
            - Default to low score if below threshold
            - Score is normalized to specific values
        """

        gp_score = await self.get_gitcoin_passport_score(user_address)

        if user_address in self.timeout_list:
            return self.null_uq_score

        if gp_score >= self.uq_score_threshold:
            return self.max_uq_score

        return self.low_uq_score

    async def get_gitcoin_passport_score(self, user_address: Address) -> float:
        """
        Get the Gitcoin Passport score for a user.

        This method retrieves and processes the user's Gitcoin Passport stamps
        to calculate their score, with special handling for guest list users.
        The raw passport score is later used to determine the UQ score.

        Score Calculation:
        1. Get saved stamps for the user
        2. If no stamps:
            - Guest list users get 21.0
            - Others get 0.0
        3. If in timeout list, return 0.0
        4. Remove GTC staking stamp score
        5. Add guest stamp bonus if applicable

        Note: This raw passport score is different from the UQ score:
        - Passport score: Raw score from Gitcoin (0-100)
        - UQ score: Normalized to 0.0, 0.001, or 1.0
        - Used to determine reward matching eligibility

        Args:
            user_address: The user's Ethereum address

        Returns:
            float: The calculated Gitcoin Passport score

        Note:
            - Guest list users get +21.0 if no guest stamp
            - GTC staking stamps are nullified
            - Timeout list users get 0.0
            - Scores are relative to current time
            - Raw score is used to determine UQ score
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

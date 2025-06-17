"""
Matched rewards calculation and estimation services.

This module provides services for calculating and estimating matched rewards,
which are distributed based on the locked ratio and various thresholds.

Key Concepts:
    - Matched Rewards:
        - Portion of staking proceeds distributed to projects
        - Calculated based on locked ratio thresholds
        - Includes patron rewards
        - Affected by three key percentages:
            - TR (Total Rewards): Maximum threshold
            - IRE (Initial Rewards): Minimum threshold
            - Matched Rewards: Base percentage of proceeds

    - Locked Ratio:
        - Ratio of locked tokens to total supply
        - Determines reward distribution strategy
        - Must be between IRE and TR percentages
        - Affects final reward calculation

    - Reward Calculation:
        - Three possible strategies based on locked ratio:
            1. Below IRE: Full matched rewards + patron rewards
            2. Between IRE and TR: Partial matched rewards + patron rewards
            3. Above TR: Only patron rewards
        - Patron rewards always included
        - Staking proceeds used as base amount

    - Estimation Process:
        - Uses pending snapshot data
        - Considers epoch details
        - Includes patron rewards
        - Validates locked ratio constraints
"""

from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from v2.snapshots.repositories import get_pending_epoch_snapshot
from v2.epochs.subgraphs import EpochsSubgraph
from v2.user_patron_mode.repositories import get_patrons_rewards


@dataclass
class MatchedRewardsEstimator:
    """
    Service for estimating matched rewards for a pending epoch.

    This class handles the calculation of estimated matched rewards based on
    the current locked ratio and various threshold percentages.

    Attributes:
        session: Database session for data access
        epochs_subgraph: Subgraph client for epoch data
        tr_percent: Total Rewards threshold percentage
        ire_percent: Initial Rewards threshold percentage
        matched_rewards_percent: Base percentage of proceeds for matched rewards
        epoch_number: The epoch to calculate rewards for

    Note:
        - TR must be greater than IRE
        - Locked ratio must be less than TR
        - Patron rewards are always included
    """

    # Dependencies
    session: AsyncSession
    epochs_subgraph: EpochsSubgraph
    # Parameters
    tr_percent: Decimal
    ire_percent: Decimal
    matched_rewards_percent: Decimal
    epoch_number: int

    async def get(self) -> int:
        """
        Get the estimated matched rewards for the pending epoch.

        Returns:
            int: The estimated matched rewards amount

        Note:
            - Uses pending snapshot data
            - Includes patron rewards
            - Validates locked ratio constraints
        """
        return await get_estimated_project_matched_rewards_pending(
            session=self.session,
            epochs_subgraph=self.epochs_subgraph,
            tr_percent=self.tr_percent,
            ire_percent=self.ire_percent,
            matched_rewards_percent=self.matched_rewards_percent,
            epoch_number=self.epoch_number,
        )


async def get_estimated_project_matched_rewards_pending(
    # Dependencies
    session: AsyncSession,
    epochs_subgraph: EpochsSubgraph,
    # Settings
    tr_percent: Decimal,
    ire_percent: Decimal,
    matched_rewards_percent: Decimal,
    # Arguments
    epoch_number: int,
) -> int:
    """
    Get the estimated matched rewards for the pending epoch.

    This function calculates the estimated matched rewards based on:
    1. Current locked ratio from pending snapshot
    2. Threshold percentages (TR, IRE)
    3. Staking proceeds
    4. Patron rewards

    Args:
        session: Database session
        epochs_subgraph: Subgraph client
        tr_percent: Total Rewards threshold
        ire_percent: Initial Rewards threshold
        matched_rewards_percent: Base percentage for matched rewards
        epoch_number: Target epoch number

    Returns:
        int: Estimated matched rewards amount

    Raises:
        ValueError: If no pending snapshot exists
        ValueError: If locked ratio exceeds TR threshold

    Note:
        - Requires valid pending snapshot
        - Validates locked ratio constraints
        - Includes patron rewards
    """

    pending_snapshot = await get_pending_epoch_snapshot(session, epoch_number)
    if pending_snapshot is None:
        raise ValueError(f"No pending snapshot for epoch {epoch_number}")

    epoch_details = await epochs_subgraph.get_epoch_by_number(epoch_number)
    patrons_rewards = await get_patrons_rewards(
        session, epoch_details.finalized_timestamp.datetime(), epoch_number
    )

    return _calculate_percentage_matched_rewards(
        locked_ratio=Decimal(pending_snapshot.locked_ratio),
        tr_percent=tr_percent,
        ire_percent=ire_percent,
        staking_proceeds=int(pending_snapshot.eth_proceeds),
        patrons_rewards=patrons_rewards,
        matched_rewards_percent=matched_rewards_percent,
    )


def _calculate_percentage_matched_rewards(
    locked_ratio: Decimal,
    tr_percent: Decimal,
    ire_percent: Decimal,
    staking_proceeds: int,
    patrons_rewards: int,
    matched_rewards_percent: Decimal,  # Config
) -> int:
    """
    Calculate matched rewards based on locked ratio and thresholds.

    The calculation follows three strategies based on the locked ratio:
    1. If locked_ratio < ire_percent:
       - Full matched rewards (matched_rewards_percent * staking_proceeds)
       - Plus patron rewards
    2. If ire_percent <= locked_ratio < tr_percent:
       - Partial matched rewards ((tr_percent - locked_ratio) * staking_proceeds)
       - Plus patron rewards
    3. If locked_ratio >= tr_percent:
       - Only patron rewards

    Args:
        locked_ratio: Current ratio of locked tokens
        tr_percent: Total Rewards threshold
        ire_percent: Initial Rewards threshold
        staking_proceeds: Total staking proceeds
        patrons_rewards: Rewards for patron mode users
        matched_rewards_percent: Base percentage for matched rewards

    Returns:
        int: Calculated matched rewards amount

    Raises:
        ValueError: If locked_ratio exceeds tr_percent

    Note:
        - locked_ratio must be less than tr_percent
        - patron_rewards are always included
        - Result is rounded to integer
    """

    if locked_ratio > tr_percent:
        raise ValueError("Invalid Strategy - locked_ratio > tr_percent")

    if locked_ratio < ire_percent:
        return int(matched_rewards_percent * staking_proceeds + patrons_rewards)

    if ire_percent <= locked_ratio < tr_percent:
        return int((tr_percent - locked_ratio) * staking_proceeds + patrons_rewards)

    return patrons_rewards

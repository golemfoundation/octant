from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from v2.snapshots.repositories import get_pending_epoch_snapshot
from v2.epochs.subgraphs import EpochsSubgraph
from v2.user_patron_mode.repositories import get_patrons_rewards


@dataclass
class MatchedRewardsEstimator:
    # Dependencies
    session: AsyncSession
    epochs_subgraph: EpochsSubgraph
    # Parameters
    tr_percent: Decimal
    ire_percent: Decimal
    matched_rewards_percent: Decimal
    epoch_number: int

    async def get(self) -> int:
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
    if locked_ratio > tr_percent:
        raise ValueError("Invalid Strategy - locked_ratio > tr_percent")

    if locked_ratio < ire_percent:
        return int(matched_rewards_percent * staking_proceeds + patrons_rewards)

    if ire_percent <= locked_ratio < tr_percent:
        return int((tr_percent - locked_ratio) * staking_proceeds + patrons_rewards)

    return patrons_rewards

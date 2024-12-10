from fastapi import APIRouter

from v2.epochs.dependencies import (
    GetCurrentEpoch,
    GetIndexedEpoch,
    GetRewardsRate,
)
from v2.epochs.schemas import (
    CurrentEpochResponseV1,
    IndexedEpochResponseV1,
    EpochRewardsRateResponseV1,
)

api = APIRouter(prefix="/epochs", tags=["Epochs"])


@api.get("/current")
async def get_current_epoch_v1(
    current_epoch: GetCurrentEpoch,
) -> CurrentEpochResponseV1:
    """
    Returns the current epoch number from the blockchain.

    This endpoint queries the smart contract to get the current active epoch number.
    The epoch number is used throughout the system to track allocation periods
    and rewards distribution cycles.

    Args:
        current_epoch (int): Injected dependency representing the current epoch number
                             retrieved from the blockchain.
    """
    return CurrentEpochResponseV1(current_epoch=current_epoch)


@api.get("/indexed")
async def get_indexed_epoch_v1(
    current_epoch: GetCurrentEpoch, indexed_epoch: GetIndexedEpoch
) -> IndexedEpochResponseV1:
    """
    Returns the last indexed epoch number and current epoch number from the blockchain.

    This endpoint provides information about the indexing status of epochs by returning both
    the current epoch number and the last epoch that has been fully indexed in the subgraph.
    The indexed epoch will always be less than or equal to the current epoch.
    If they differ, it means the subgraph is still being updated.

    Args:
        current_epoch (int): Injected dependency representing the current epoch number
                             retrieved from the blockchain.
        indexed_epoch (int): Injected dependency representing the last indexed epoch number
                             retrieved from the subgraph.
    """
    return IndexedEpochResponseV1(
        current_epoch=current_epoch, indexed_epoch=indexed_epoch
    )


# TODO: Requires epoch_rewards implementation that is WIP: https://linear.app/golemfoundation/issue/OCT-2236/migrate-post-rewardsestimated-budget
# @api.get("/info/{epoch_number}")
# async def get_epoch_stats_v1(
#     session: GetSession,
#     epoch: int
# ) -> EpochStatsResponse:
#     """
#     Returns statistics on a given epoch. Returns data only for historic and currently pending epochs.
#     """
#     stats = await get_epoch_stats(session, epoch)
#     return stats


@api.get("/rewards-rate/{epoch_number}")
async def get_epoch_rewards_rate_v1(
    rewards_rate: GetRewardsRate,
) -> EpochRewardsRateResponseV1:
    """
    Returns the rewards rate for a specific epoch from the blockchain.

    This endpoint queries the smart contract to get the rewards rate for the specified epoch number.
    The rewards rate represents the percentage of rewards distributed for that epoch and is used
    in calculating final reward amounts.

    Args:
        epoch_number (int): The epoch number in the blockchain to fetch rewards rate for.
        rewards_rate (float): Injected dependency representing the rewards rate retrieved
                              from the blockchain.
    """
    return EpochRewardsRateResponseV1(rewards_rate=rewards_rate)

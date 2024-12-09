from fastapi import APIRouter

from v2.epochs.dependencies import (
    GetEpochsContracts,
    GetCurrentEpoch,
    GetIndexedEpoch,
    GetRewardsRate,
)
from v2.epochs.schemas import (
    CurrentEpochResponse,
    IndexedEpochResponse,
    EpochRewardsRateResponse,
)

api = APIRouter(prefix="/epochs", tags=["Epochs"])


@api.get("/current")
async def get_current_epoch_v1(
    epochs_contract: GetEpochsContracts,
) -> CurrentEpochResponse:
    """
    Returns the current epoch number from the blockchain.

    This endpoint queries the smart contract to get the current active epoch number.
    The epoch number is used throughout the system to track allocation periods
    and rewards distribution cycles.

    Returns:
        CurrentEpochResponse: Object containing the current epoch number
    """
    current_epoch = epochs_contract.get_current_epoch()
    return CurrentEpochResponse(current_epoch=current_epoch)


@api.get("/indexed")
async def get_indexed_epoch_v1(
    current_epoch: GetCurrentEpoch, indexed_epoch: GetIndexedEpoch
) -> IndexedEpochResponse:
    """
    Returns the last indexed epoch number and current epoch number from the blockchain.

    This endpoint provides information about the indexing status of epochs by returning both
    the current epoch number and the last epoch that has been fully indexed in the system.
    The indexed epoch will always be less than or equal to the current epoch.

    Returns:
        IndexedEpochResponse: Object containing both the current epoch number and last indexed epoch number
    """
    return IndexedEpochResponse(
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
) -> EpochRewardsRateResponse:
    """
    Returns the rewards rate for a specific epoch from the blockchain.

    This endpoint queries the smart contract to get the rewards rate for the specified epoch number.
    The rewards rate represents the percentage of rewards that will be distributed for that epoch,
    and is used in calculating final reward amounts.

    Args:
        rewards_rate (float): The rewards rate retrieved from the blockchain via dependency injection

    Returns:
        EpochRewardsRateResponse: Object containing the rewards rate for the specified epoch
    """
    return EpochRewardsRateResponse(rewards_rate=rewards_rate)

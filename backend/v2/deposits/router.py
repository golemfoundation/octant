"""
Deposit management endpoints for handling user deposits and effective deposit calculations.

This module provides endpoints for querying deposit information, including:
- Total effective deposits for epochs
- Locked ratio calculations
- User-specific effective deposits
- Estimated deposits for current epoch

Key Concepts:
    - Deposit: A user's locked GLM tokens in the system
    - Effective Deposit: The actual amount of deposit that counts towards rewards, calculated
      based on lock/unlock events and Sablier streams
    - Locked Ratio: The ratio of locked deposits to total effective deposits, used for reward distribution
    - Epoch: A time period during which deposits are collected and rewards are distributed
    - Pending Epoch: Current epoch that is in pending state (open Allocation Window)
    - Finalized Epoch: A completed epoch with finalized deposit data stored in the database
    - Sablier Streams: Time-locked token streams that affect effective deposit calculations
    - Lock/Unlock Events: Direct deposit operations that affect effective deposit calculations

Data Sources:
    - Subgraph: Provides real-time lock/unlock events and Sablier stream data
    - Database: Stores finalized deposit data for completed epochs
    - Current State: Used for estimating deposits in the current epoch
"""

from fastapi import APIRouter

from app.exceptions import EffectiveDepositNotFoundException, InvalidEpoch
from v2.core.dependencies import GetSession
from v2.core.types import Address
from v2.deposits.dependencies import GetDepositEventsRepository
from v2.deposits.repositories import get_user_deposit
from v2.snapshots.repositories import get_pending_epoch_snapshot
from v2.epochs.dependencies import GetEpochsContracts, GetEpochsSubgraph
from v2.project_rewards.services import calculate_effective_deposits
from v2.deposits.schemas import (
    LockedRatioResponseV1,
    TotalEffectiveDepositResponseV1,
    UserEffectiveDepositResponseV1,
)


api = APIRouter(prefix="/deposits", tags=["Deposits"])


@api.get("/{epoch_number}/total_effective")
async def get_total_effective_deposit(
    session: GetSession, epoch_number: int
) -> TotalEffectiveDepositResponseV1:
    """
    Returns value of total effective deposits made by the end of an epoch.

    This endpoint retrieves the total effective deposits for a specific epoch from the
    database. Taken directly from the pending snapshot. The data represents the final
    state of deposits after all lock/unlock events and Sablier streams have been processed.

    Path Parameters:
        - epoch_number: The epoch number to get total effective deposits for

    Returns:
        TotalEffectiveDepositResponseV1 containing:
            - total_effective: The total amount of effective deposits in the epoch

    Raises:
        - InvalidEpoch: If the epoch number is invalid or data is not available

    Note:
        - Works based on solely on the pending snapshot information (snapshot made right at the start of Allocation Window)
    """

    pending_snapshot = await get_pending_epoch_snapshot(session, epoch_number)

    if pending_snapshot is None:
        raise InvalidEpoch()

    return TotalEffectiveDepositResponseV1(
        total_effective=pending_snapshot.total_effective_deposit
    )


@api.get("/total_effective/estimated")
async def get_estimated_total_effective_deposit(
    deposit_events_repository: GetDepositEventsRepository,
    epochs_contracts: GetEpochsContracts,
    epochs_subgraph: GetEpochsSubgraph,
) -> TotalEffectiveDepositResponseV1:
    """
    Returns value of estimated total effective deposits for current epoch.

    This endpoint calculates an estimate of the total effective deposits for the current
    epoch by:
    1. Fetching all lock/unlock events from the Subgraph
    2. Processing Sablier streams
    3. Calculating effective deposits based on current state
    4. Simulating epoch end as if no further events will happen

    Returns:
        TotalEffectiveDepositResponseV1 containing:
            - total_effective: The estimated total amount of effective deposits

    Note:
        - Calculation includes both direct locks/unlocks and Sablier streams
        - Simulates epoch end assuming no further events (locks/unlocks/Sablier streams) will happen
        - May differ from final total after epoch ends (because new events may happen)
        - Used for real-time deposit tracking during allocation window
        - Deposists are based on previous epoch data (from database)
    """

    # Get current epoch details
    epoch_number = await epochs_contracts.get_current_epoch()
    epoch_details = await epochs_subgraph.fetch_epoch_by_number(epoch_number)

    # We SIMULATE the epoch end as if it ended now
    epoch_end = epoch_details.fromTs + epoch_details.duration
    epoch_start = epoch_details.fromTs

    # If secondary address has effective deposit, it cannot delegate
    events = await deposit_events_repository.get_all_users_events(
        epoch_number, epoch_start, epoch_end
    )
    _, total = calculate_effective_deposits(epoch_start, epoch_end, events)

    return TotalEffectiveDepositResponseV1(total_effective=total)


@api.get("/{epoch_number}/locked_ratio")
async def get_locked_ratio(
    session: GetSession, epoch_number: int
) -> LockedRatioResponseV1:
    """
    Returns value of locked ratio of total effective deposits made by the end of an epoch.

    This endpoint retrieves the ratio of locked deposits to total effective deposits
    for a specific epoch.

    Path Parameters:
        - epoch_number: The epoch number to get locked ratio for

    Returns:
        LockedRatioResponseV1 containing:
            - locked_ratio: The ratio of locked deposits to total effective deposits

    Raises:
        - InvalidEpoch: If the epoch number is invalid or data is not available

    Note:
        - Works solely on the pending snapshot information (snapshot made right at the start of Allocation Window)
    """

    pending_snapshot = await get_pending_epoch_snapshot(session, epoch_number)

    if pending_snapshot is None:
        raise InvalidEpoch()

    return LockedRatioResponseV1(locked_ratio=pending_snapshot.locked_ratio)


@api.get("/users/{user_address}/estimated_effective_deposit")
async def get_user_estimated_effective_deposit(
    # Dependencies
    deposit_events_repository: GetDepositEventsRepository,
    epochs_contracts: GetEpochsContracts,
    epochs_subgraph: GetEpochsSubgraph,
    # Request params
    user_address: Address,
) -> UserEffectiveDepositResponseV1:
    """
    Returns user's estimated effective deposit for the current epoch.

    This endpoint calculates an estimate of a user's effective deposit for the current
    epoch by:
    1. Fetching user's lock/unlock events from the Subgraph
    2. Processing user's Sablier streams
    3. Calculating effective deposit based on current state
    4. Simulating epoch end as if no further events will happen

    Path Parameters:
        - user_address: The Ethereum address of the user

    Returns:
        UserEffectiveDepositResponseV1 containing:
            - effective_deposit: The estimated effective deposit amount

    Note:
        - Calculation includes both direct locks/unlocks and Sablier streams
        - Simulates epoch end as if no further events will happen
        - May differ from final amount after epoch ends (because new events may happen)
        - Used for real-time deposit tracking during allocation window
        - Deposists are based on previous epoch data (from database)
    """

    # Get current epoch details
    epoch_number = await epochs_contracts.get_current_epoch()
    epoch_details = await epochs_subgraph.fetch_epoch_by_number(epoch_number)

    # We SIMULATE the epoch end as if it ended now
    epoch_end = epoch_details.fromTs + epoch_details.duration
    epoch_start = epoch_details.fromTs

    user_events = await deposit_events_repository.get_all_user_events(
        user_address, epoch_number, epoch_start, epoch_end
    )
    deposits, _ = calculate_effective_deposits(
        epoch_start, epoch_end, {user_address: user_events}
    )

    effective_deposit = deposits[0].effective_deposit if deposits else 0

    return UserEffectiveDepositResponseV1(effective_deposit=effective_deposit)


@api.get("/users/{user_address}/{epoch_number}")
async def get_user_effective_deposit(
    # Dependencies
    session: GetSession,
    deposit_events_repository: GetDepositEventsRepository,
    epochs_contracts: GetEpochsContracts,
    epochs_subgraph: GetEpochsSubgraph,
    # Request params
    user_address: Address,
    epoch_number: int,
) -> UserEffectiveDepositResponseV1:
    """
    Returns user's effective deposit for a finalized or pending epoch.

    This endpoint retrieves a user's effective deposit for a specific epoch.
    For the current epoch, it returns an estimate based on current state.
    For past epochs, it returns the finalized value from the database.

    Path Parameters:
        - user_address: The Ethereum address of the user
        - epoch_number: The epoch number to get effective deposit for

    Returns:
        UserEffectiveDepositResponseV1 containing:
            - effective_deposit: The effective deposit amount

    Raises:
        - EffectiveDepositNotFoundException: If no deposit record exists for the user in the specified epoch

    Note:
        - For current epoch: returns estimated value based on current state
        - For past epochs: returns finalized value from database
        - Returns 0 if user has no deposits in the epoch
        - Calculation includes both direct locks/unlocks and Sablier streams
    """

    # When asked about current epoch, we return estimated effective deposit
    current_epoch = await epochs_contracts.get_current_epoch()
    if epoch_number == current_epoch:
        return await get_user_estimated_effective_deposit(
            deposit_events_repository,
            epochs_contracts,
            epochs_subgraph,
            user_address,
        )

    # When asked about a past epoch we return the effective deposit saved in the DB
    deposit = await get_user_deposit(session, user_address, epoch_number)
    if deposit is None:
        raise EffectiveDepositNotFoundException(epoch_number, user_address)

    return UserEffectiveDepositResponseV1(effective_deposit=deposit.effective_deposit)

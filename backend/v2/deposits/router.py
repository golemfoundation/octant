from fastapi import APIRouter

from app.exceptions import EffectiveDepositNotFoundException, InvalidEpoch
from v2.core.dependencies import GetCurrentTimestamp, GetSession
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
    Latest data and data for any given point in time from the past is available in the Subgraph.
    """

    pending_snapshot = await get_pending_epoch_snapshot(session, epoch_number)

    if pending_snapshot is None:
        raise InvalidEpoch()

    return TotalEffectiveDepositResponseV1(
        total_effective=pending_snapshot.total_effective_deposit
    )


@api.get("/total_effective/estimated")
async def get_estimated_total_effective_deposit(
    session: GetSession,
    deposit_events_repository: GetDepositEventsRepository,
    epochs_contracts: GetEpochsContracts,
    epochs_subgraph: GetEpochsSubgraph,
    current_timestamp: GetCurrentTimestamp,
) -> TotalEffectiveDepositResponseV1:
    """
    Returns value of estimated total effective deposits for current epoch.
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
    Latest data and data for any given point in time from the past is available in the Subgraph.
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
    current_timestamp: GetCurrentTimestamp,
    # Request params
    user_address: Address,
) -> UserEffectiveDepositResponseV1:
    """
    Returns user's estimated effective deposit for the current epoch.
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
    current_timestamp: GetCurrentTimestamp,
    # Request params
    user_address: Address,
    epoch_number: int,
) -> UserEffectiveDepositResponseV1:
    """
    Returns user's effective deposit for a finalized or pending epoch.
    """

    # When asked about current epoch, we return estimated effective deposit
    current_epoch = await epochs_contracts.get_current_epoch()
    if epoch_number == current_epoch:
        return await get_user_estimated_effective_deposit(
            deposit_events_repository,
            epochs_contracts,
            epochs_subgraph,
            current_timestamp,
            user_address,
        )

    # When asked about a past epoch we return the effective deposit saved in the DB
    deposit = await get_user_deposit(session, user_address, epoch_number)
    if deposit is None:
        raise EffectiveDepositNotFoundException(epoch_number, user_address)

    return UserEffectiveDepositResponseV1(effective_deposit=deposit.effective_deposit)

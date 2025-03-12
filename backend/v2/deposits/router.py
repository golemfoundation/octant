from fastapi import APIRouter

from backend.app.exceptions import EffectiveDepositNotFoundException, InvalidEpoch
from backend.v2.core.dependencies import GetCurrentTimestamp, GetSession
from backend.v2.core.types import Address
from backend.v2.deposits.dependencies import GetDepositEventsRepository
from backend.v2.deposits.repositories import get_user_deposit
from backend.v2.epoch_snapshots.repositories import get_pending_epoch_snapshot
from backend.v2.epochs.dependencies import GetEpochsContracts, GetEpochsSubgraph
from backend.v2.project_rewards.services import calculate_effective_deposits
from v2.deposits.schemas import LockedRatioResponseV1, TotalEffectiveDepositResponseV1, UserEffectiveDepositResponseV1


api = APIRouter(prefix="/deposits", tags=["Deposits"])


@api.get("/{epoch_number}/total_effective")
async def get_total_effective_deposit(
    session: GetSession,
    epoch_number: int
) -> TotalEffectiveDepositResponseV1:
    """
    Returns value of total effective deposits made by the end of an epoch.
    Latest data and data for any given point in time from the past is available in the Subgraph.
    """

    pending_snapshot = await get_pending_epoch_snapshot(session, epoch_number)

    if pending_snapshot is None:
        raise InvalidEpoch()

    return TotalEffectiveDepositResponseV1(total_effective=pending_snapshot.total_effective_deposit)


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
    epoch_end = current_timestamp
    epoch_start = epoch_details.fromTs

    # If secondary address has effective deposit, it cannot delegate
    events = await deposit_events_repository.get_all_users_events(
        epoch_number, epoch_start, epoch_end
    )
    _, total = calculate_effective_deposits(epoch_start, epoch_end, events)

    return TotalEffectiveDepositResponseV1(total_effective=total)


@api.get("/{epoch_number}/locked_ratio")
async def get_locked_ratio(
    session: GetSession,
    epoch_number: int
) -> LockedRatioResponseV1:
    """
    Returns value of locked ratio of total effective deposits made by the end of an epoch.
    Latest data and data for any given point in time from the past is available in the Subgraph.
    """

    pending_snapshot = await get_pending_epoch_snapshot(session, epoch_number)

    if pending_snapshot is None:
        raise InvalidEpoch()

    return LockedRatioResponseV1(locked_ratio=pending_snapshot.locked_ratio)


@api.get("/users/{user_address}/{epoch_number}")
async def get_user_effective_deposit(
    session: GetSession,
    user_address: Address,
    epoch_number: int
) -> UserEffectiveDepositResponseV1:
    """
    Returns user's effective deposit for a finalized or pending epoch.
    """

    deposit = await get_user_deposit(session, user_address, epoch_number)

    if deposit is None:
        raise EffectiveDepositNotFoundException(epoch_number, user_address)

    return UserEffectiveDepositResponseV1(effective_deposit=deposit.effective_deposit)


@api.get("/users/{user_address}/estimated_effective_deposit")
async def get_user_estimated_effective_deposit(
    session: GetSession,
    user_address: Address,
    deposit_events_repository: GetDepositEventsRepository,
    epochs_contracts: GetEpochsContracts,
    epochs_subgraph: GetEpochsSubgraph,
    current_timestamp: GetCurrentTimestamp,
) -> UserEffectiveDepositResponseV1:
    """
    Returns user's estimated effective deposit for the current epoch.
    """

    # Get current epoch details
    epoch_number = await epochs_contracts.get_current_epoch()
    epoch_details = await epochs_subgraph.fetch_epoch_by_number(epoch_number)

    # We SIMULATE the epoch end as if it ended now
    epoch_end = current_timestamp
    epoch_start = epoch_details.fromTs

    events = await deposit_events_repository.get_user_events(
        epoch_number, epoch_start, epoch_end
    )
    deposits, _ = calculate_effective_deposits(epoch_start, epoch_end, events)

    effective_deposit = deposits[0].effective_deposit if deposits else 0

    return UserEffectiveDepositResponseV1(effective_deposit=effective_deposit)

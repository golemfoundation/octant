"""
User history management endpoints for tracking user actions and events.

This module provides endpoints for retrieving a user's complete history of actions
in the system, including deposits, withdrawals, allocations, and patron donations.

Key Concepts:
    - History Items: Individual events in a user's history
    - Event Types:
        - lock: Direct deposit of GLM tokens
        - unlock: Withdrawal of locked GLM tokens
        - allocation: Distribution of rewards to projects
        - withdrawal: Claiming of rewards
        - patron_mode_donation: Donations made in patron mode

    - Event Data:
        - amount: The amount involved in the action (in wei)
        - transaction_hash: Blockchain transaction hash (for locks, unlocks, withdrawals)
        - epoch: The epoch number (for patron donations)
        - is_manually_edited: Whether allocation was manually edited
        - leverage: The leverage applied to allocated funds
        - allocations: List of project allocations with amounts

    - Pagination:
        - Cursor-based pagination
        - Results ordered by timestamp (newest first)
        - Configurable page size (max 100 items)
        - Next cursor for subsequent pages

    - Data Sources:
        - Deposit Events Repository: For lock/unlock events
        - Epochs Subgraph: For withdrawal events
        - Database: For allocation history
        - Patron Mode: For patron donations
"""

from typing import Annotated
import asyncio

from fastapi import APIRouter, Query
from app.modules.common.pagination import Cursor, Paginator
from v2.core.dependencies import GetSession
from v2.core.types import Address
from v2.deposits.dependencies import GetDepositEventsRepository
from v2.epochs.dependencies import GetEpochsSubgraph
from v2.history.schema import UserHistoryResponseV1
from v2.snapshots.repositories import get_last_finalized_snapshot_epoch_number
from v2.user_patron_mode.repositories import get_patron_epoch_donation
from v2.history.schema import HistoryItemV1, HistoryItemDataV1
from v2.history.services import (
    get_user_locks,
    get_user_unlocks,
    get_user_withdrawals,
    get_user_allocations,
)

api = APIRouter(prefix="/history", tags=["History"])


@api.get("/{user_address}")
async def get_user_history(
    session: GetSession,
    epochs_subgraph: GetEpochsSubgraph,
    deposit_events_repository: GetDepositEventsRepository,
    user_address: Address,
    cursor: Annotated[str | None, Query()] = None,
    limit: Annotated[int | None, Query()] = None,
) -> UserHistoryResponseV1:
    """
    Get the complete history for a given user.

    This endpoint retrieves and combines all historical events for a user, including:
    - Lock events (direct deposits)
    - Unlock events (withdrawals of locked tokens)
    - Withdrawal events (claiming of rewards)
    - Allocation events (distribution of rewards)
    - Patron mode donations

    The events are fetched concurrently from different sources and combined into a
    single chronological timeline, ordered from newest to oldest.

    Path Parameters:
        - user_address: The Ethereum address of the user

    Query Parameters:
        - cursor: Pagination cursor for retrieving next page
        - limit: Maximum number of items to return (default: 100, max: 100)

    Returns:
        UserHistoryResponseV1 containing:
            - history: List of HistoryItemV1 objects, each containing:
                - type: The type of event (lock, unlock, allocation, withdrawal, patron_mode_donation)
                - timestamp: Unix timestamp of the event
                - event_data: Additional event-specific data:
                    - amount: Amount involved (for all types)
                    - transaction_hash: Transaction hash (for locks, unlocks, withdrawals)
                    - epoch: Epoch number (for patron donations)
                    - is_manually_edited: Whether allocation was edited (for allocations)
                    - leverage: Leverage value (for allocations)
                    - allocations: List of project allocations (for allocations)
            - next_cursor: Cursor for retrieving the next page of results

    Note:
        - Results are ordered by timestamp (newest first)
        - Each event type has specific additional data
        - Patron donations are only included for finalized epochs
        - Maximum page size is 100 items
        - Events are fetched concurrently for better performance
    """

    limit = limit if limit is not None and limit < 100 else 100
    from_timestamp, offset_at_timestamp = Cursor.decode(cursor)
    from_ts = int(from_timestamp.timestamp_s())
    query_limit = limit + offset_at_timestamp + 1

    # Fetch all history items concurrently
    # we can do this here only because locks, unlocks, withdrawals do not use db
    #   and only allocations use db so there's not race conditions on session db access.
    locks, unlocks, withdrawals, allocations = await asyncio.gather(
        get_user_locks(deposit_events_repository, user_address, from_ts, query_limit),
        get_user_unlocks(deposit_events_repository, user_address, from_ts, query_limit),
        get_user_withdrawals(epochs_subgraph, user_address, from_ts, query_limit),
        get_user_allocations(session, user_address, from_ts, query_limit),
        return_exceptions=True,
    )

    # If any of the results is an exception, raise it
    for result in [locks, unlocks, withdrawals, allocations]:
        if isinstance(result, Exception):
            raise result

    # patron donations
    patron_donations: list[HistoryItemV1] = []
    last_finalized_snapshot_epoch_number = (
        await get_last_finalized_snapshot_epoch_number(session)
    )

    epoch_details = await epochs_subgraph.get_epochs_range(
        1, last_finalized_snapshot_epoch_number
    )
    for epoch_detail in epoch_details:
        # Discard epochs that are outside of currently used time range
        if epoch_detail.finalized_timestamp > from_timestamp:
            continue

        # If user was a patron in the given epoch, add the donation to the history
        patron_donation = await get_patron_epoch_donation(
            session,
            user_address,
            epoch_detail.epoch_num,
            epoch_detail.finalized_timestamp.datetime(),
        )
        if patron_donation is None:
            continue

        patron_donations.append(
            HistoryItemV1(
                type="patron_mode_donation",
                timestamp=str(int(epoch_detail.finalized_timestamp.timestamp_s())),
                event_data=HistoryItemDataV1(
                    amount=patron_donation,
                    epoch=epoch_detail.epoch_num,
                ),
            )
        )

    sorted_history = sorted(
        locks + unlocks + withdrawals + allocations + patron_donations,
        key=lambda x: (
            x.timestamp,
            x.type,
            getattr(x.event_data, "amount", None),
            getattr(x.event_data, "transaction_hash", None),
        ),
        reverse=True,
    )

    history, next_cursor = Paginator.extract_page(
        sorted_history, offset_at_timestamp, limit
    )

    return UserHistoryResponseV1(
        history=history,
        next_cursor=next_cursor,
    )

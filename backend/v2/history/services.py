from typing import List
from v2.allocations.repositories import get_user_allocations_history
from v2.core.types import Address
from v2.history.schema import HistoryItemV1, HistoryItemDataV1, ProjectAllocationItemV1
from v2.deposits.dependencies import GetDepositEventsRepository
from v2.epochs.dependencies import GetEpochsSubgraph
from v2.core.dependencies import GetSession


async def get_user_locks(
    deposit_events_repository: GetDepositEventsRepository,
    user_address: Address,
    from_ts: int,
    query_limit: int,
) -> List[HistoryItemV1]:
    locks = await deposit_events_repository.get_locks(
        user_address, from_ts, query_limit
    )
    return [
        HistoryItemV1(
            type="lock",
            timestamp=str(int(lock.timestamp.timestamp_s())),
            event_data=HistoryItemDataV1(
                amount=lock.amount,
                transaction_hash=lock.transaction_hash,
            ),
        )
        for lock in locks
    ]


async def get_user_unlocks(
    deposit_events_repository: GetDepositEventsRepository,
    user_address: Address,
    from_ts: int,
    query_limit: int,
) -> List[HistoryItemV1]:
    unlocks = await deposit_events_repository.get_unlocks(
        user_address, from_ts, query_limit
    )
    return [
        HistoryItemV1(
            type="unlock",
            timestamp=str(int(unlock.timestamp.timestamp_s())),
            event_data=HistoryItemDataV1(
                amount=unlock.amount,
                transaction_hash=unlock.transaction_hash,
            ),
        )
        for unlock in unlocks
    ]


async def get_user_withdrawals(
    epochs_subgraph: GetEpochsSubgraph,
    user_address: Address,
    from_ts: int,
    query_limit: int,
) -> List[HistoryItemV1]:
    withdrawals = await epochs_subgraph.get_user_withdrawals_history(
        user_address, from_ts, query_limit
    )
    return [
        HistoryItemV1(
            type="withdrawal",
            timestamp=str(withdrawal.timestamp),
            event_data=HistoryItemDataV1(
                amount=withdrawal.amount,
                transaction_hash=withdrawal.transaction_hash,
            ),
        )
        for withdrawal in withdrawals
    ]


async def get_user_allocations(
    session: GetSession,
    user_address: Address,
    from_ts: int,
    query_limit: int,
) -> List[HistoryItemV1]:
    allocations_history = await get_user_allocations_history(
        session, user_address, from_ts, query_limit
    )
    return [
        HistoryItemV1(
            type="allocation",
            timestamp=str(int(request.created_at.timestamp())),
            event_data=HistoryItemDataV1(
                is_manually_edited=request.is_manually_edited,
                leverage=request.leverage,
                allocations=[
                    ProjectAllocationItemV1(
                        project_address=a.project_address, amount=a.amount
                    )
                    for a in allocations
                ],
            ),
        )
        for request, allocations in allocations_history
    ]

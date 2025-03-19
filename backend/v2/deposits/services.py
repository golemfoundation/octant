from itertools import groupby
from operator import attrgetter
from sqlalchemy.ext.asyncio import AsyncSession

from app.engine.user.effective_deposit import (
    DepositEvent,
    EventType,
)
from app.modules.common.sablier_events_mapper import (
    FlattenStrategy,
    flatten_sablier_events,
    process_to_locks_and_unlocks,
)
from app.modules.user.events_generator.core import unify_deposit_balances
from v2.deposits.repositories import get_all_deposit_events_for_epoch, get_user_deposit
from v2.epochs.subgraphs import EpochsSubgraph
from v2.sablier.subgraphs import SablierSubgraph


class DepositEventsStore:
    def __init__(
        self,
        session: AsyncSession,
        epochs_subgraph: EpochsSubgraph,
        sablier_subgraph: SablierSubgraph,
        sablier_unlock_grace_period: int,
    ):
        self.session = session
        self.epochs_subgraph = epochs_subgraph
        self.sablier_subgraph = sablier_subgraph
        self.sablier_unlock_grace_period = sablier_unlock_grace_period

    async def get_all_user_events(
        self,
        user_address: str,
        epoch_number: int,
        start_sec: int,
        end_sec: int,
    ) -> list[DepositEvent]:
        """
        Returns all events of a given user (LOCK, UNLOCK) for a given epoch.
        """

        epoch_start_deposit = await get_user_deposit(
            self.session, user_address, epoch_number - 1
        )
        deposit_before = (
            int(epoch_start_deposit.epoch_end_deposit) if epoch_start_deposit else 0
        )

        epoch_start_locked_amount = DepositEvent(
            user=user_address,
            type=EventType.LOCK,
            timestamp=start_sec,
            amount=0,
            deposit_before=deposit_before,
        )

        events = []
        events.extend(
            await self.epochs_subgraph.fetch_locks_by_address_and_timestamp_range(
                user_address, start_sec, end_sec
            )
        )
        events.extend(
            await self.epochs_subgraph.fetch_unlocks_by_address_and_timestamp_range(
                user_address, start_sec, end_sec
            )
        )

        sablier_streams = await self.sablier_subgraph.get_user_events_history(
            user_address
        )
        mapped_streams = process_to_locks_and_unlocks(
            sablier_streams, from_timestamp=start_sec, to_timestamp=end_sec
        )
        events += flatten_sablier_events(mapped_streams, FlattenStrategy.ALL)

        events = list(map(DepositEvent.from_dict, events))
        sorted_events = sorted(events, key=attrgetter("timestamp"))

        sorted_events.insert(0, epoch_start_locked_amount)

        if len(sorted_events) == 1 and sorted_events[0].deposit_after == 0:
            return []

        sorted_events_with_unified_deposits = unify_deposit_balances(
            sorted_events, self.sablier_unlock_grace_period
        )

        return sorted_events_with_unified_deposits

    async def get_all_users_events(
        self,
        epoch_number: int,
        start_sec: int,
        end_sec: int,
    ) -> dict[str, list[DepositEvent]]:
        """
        Returns all events of all users (LOCK, UNLOCK) for a given epoch.
        """

        # Get all locked amounts for the previous epoch
        epoch_start_locked_amounts = await get_all_deposit_events_for_epoch(
            self.session, epoch_number - 1
        )
        epoch_start_events = [
            DepositEvent(
                user=user,
                type=EventType.LOCK,
                timestamp=start_sec,
                amount=0,  # it is not a deposit in fact
                deposit_before=int(deposit.epoch_end_deposit),
            )
            for user, deposit in epoch_start_locked_amounts.items()
        ]

        sablier_streams = await self.sablier_subgraph.get_all_streams_history()
        mapped_streams = process_to_locks_and_unlocks(
            sablier_streams, from_timestamp=start_sec, to_timestamp=end_sec
        )
        epoch_events = []
        epoch_events += flatten_sablier_events(mapped_streams, FlattenStrategy.ALL)
        epoch_events += await self.epochs_subgraph.fetch_locks_by_timestamp_range(
            start_sec, end_sec
        )
        epoch_events += await self.epochs_subgraph.fetch_unlocks_by_timestamp_range(
            start_sec, end_sec
        )

        epoch_events = [DepositEvent.from_dict(event) for event in epoch_events]
        sorted_events = sorted(epoch_events, key=attrgetter("user", "timestamp"))

        user_events = {
            k: list(g) for k, g in groupby(sorted_events, key=attrgetter("user"))
        }

        for event in epoch_start_events:
            if event.user in user_events:
                user_events[event.user].insert(0, event)
            else:
                user_events[event.user] = [event]

        epoch_start_users = list(map(attrgetter("user"), epoch_start_events))
        for user_address in user_events:
            if user_address not in epoch_start_users:
                user_events[user_address].insert(
                    0,
                    DepositEvent(
                        user_address,
                        EventType.LOCK,
                        timestamp=start_sec,
                        amount=0,
                        deposit_before=0,
                    ),
                )

            user_events[user_address] = unify_deposit_balances(
                user_events[user_address],
                self.sablier_unlock_grace_period,
            )

        return user_events

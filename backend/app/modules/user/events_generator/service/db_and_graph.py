from itertools import groupby
from operator import attrgetter
from typing import List, Dict

from eth_utils import to_checksum_address

from app.context.manager import Context
from app.engine.user.effective_deposit import DepositEvent, EventType
from app.infrastructure import database
from app.infrastructure.graphql.locks import (
    get_locks_by_address_and_timestamp_range,
    get_locks_by_timestamp_range,
)
from app.infrastructure.graphql.unlocks import (
    get_unlocks_by_address_and_timestamp_range,
    get_unlocks_by_timestamp_range,
)
from app.infrastructure.sablier.events import (
    get_all_streams_history,
)
from app.infrastructure.sablier.events import (
    get_user_events_history,
)
from app.modules.common.sablier_events_mapper import (
    process_to_locks_and_unlocks,
    flatten_sablier_events,
    FlattenStrategy,
)
from app.modules.user.events_generator.core import unify_deposit_balances
from app.pydantic import Model


class DbAndGraphEventsGenerator(Model):
    def get_user_events(
        self, context: Context, user_address: str
    ) -> List[DepositEvent]:
        """
        Get user lock and unlock events from the subgraph & sablier within the given timestamp range, sort them by timestamp,

        Returns:
            A list of event dictionaries sorted by timestamp.
        """

        user_address = to_checksum_address(user_address)
        epoch_num = context.epoch_details.epoch_num
        start = context.epoch_details.start_sec
        end = context.epoch_details.end_sec
        epoch_start_locked_amount = self._get_user_epoch_start_deposit(
            epoch_num, start, user_address
        )

        events = []
        events.extend(
            get_locks_by_address_and_timestamp_range(user_address, start, end)
        )
        events.extend(
            get_unlocks_by_address_and_timestamp_range(user_address, start, end)
        )
        sablier_streams = get_user_events_history(user_address)
        mapped_streams = process_to_locks_and_unlocks(
            sablier_streams, from_timestamp=start, to_timestamp=end
        )
        events += flatten_sablier_events(mapped_streams, FlattenStrategy.ALL)

        events = list(map(DepositEvent.from_dict, events))
        sorted_events = sorted(events, key=attrgetter("timestamp"))

        sorted_events.insert(0, epoch_start_locked_amount)

        if len(sorted_events) == 1 and sorted_events[0].deposit_after == 0:
            return []

        sorted_events_with_unified_deposits = unify_deposit_balances(sorted_events)

        return sorted_events_with_unified_deposits

    def get_all_users_events(self, context: Context) -> Dict[str, List[DepositEvent]]:
        """
        Get all lock and unlock events from the subgraph within the given timestamp range, sort them by user and timestamp,
        and group them by user.

        Returns:
            A dictionary where keys are user addresses and values are lists of event dictionaries sorted by timestamp.
        """

        epoch_num = context.epoch_details.epoch_num
        start = context.epoch_details.start_sec
        end = context.epoch_details.end_sec
        epoch_start_events = self._get_epoch_start_deposits(epoch_num, start)

        sablier_streams = get_all_streams_history()
        mapped_streams = process_to_locks_and_unlocks(
            sablier_streams, from_timestamp=start, to_timestamp=end
        )
        epoch_events = []
        epoch_events += flatten_sablier_events(mapped_streams, FlattenStrategy.ALL)
        epoch_events += get_locks_by_timestamp_range(start, end)
        epoch_events += get_unlocks_by_timestamp_range(start, end)

        epoch_events = list(map(DepositEvent.from_dict, epoch_events))
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
                        timestamp=start,
                        amount=0,
                        deposit_before=0,
                    ),
                )

            user_events[user_address] = unify_deposit_balances(
                user_events[user_address]
            )

        return user_events

    def _get_user_epoch_start_deposit(
        self, epoch_num: int, start: int, user_address: str
    ):
        epoch_start_locked_amount = database.deposits.get_by_user_address_and_epoch(
            user_address, epoch_num - 1
        )

        deposit_before = (
            int(epoch_start_locked_amount.epoch_end_deposit)
            if epoch_start_locked_amount is not None
            else 0
        )

        return DepositEvent(
            user=user_address,
            type=EventType.LOCK,
            timestamp=start,
            amount=0,  # it is not a deposit in fact
            deposit_before=deposit_before,
        )

    def _get_epoch_start_deposits(self, epoch_num: int, start: int):
        epoch_start_locked_amounts = database.deposits.get_all_by_epoch(epoch_num - 1)

        return [
            DepositEvent(
                user=user,
                type=EventType.LOCK,
                timestamp=start,
                amount=0,  # it is not a deposit in fact
                deposit_before=int(deposit.epoch_end_deposit),
            )
            for user, deposit in epoch_start_locked_amounts.items()
        ]

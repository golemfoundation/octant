from dataclasses import dataclass
from typing import Tuple, List

from app.engine.user import DefaultWeightedAverageEffectiveDeposit
from app.engine.user.effective_deposit import (
    UserEffectiveDepositPayload,
    LockEventsByAddr,
    DepositSource,
    EventType,
    UserDeposit,
)


@dataclass
class DefaultWeightedAverageWithSablierTimebox(DefaultWeightedAverageEffectiveDeposit):
    def calculate_users_effective_deposits(
        self, payload: UserEffectiveDepositPayload
    ) -> Tuple[List[UserDeposit], int]:
        payload.lock_events_by_addr = self._remove_unlock_and_lock_within_24_hours(
            payload.lock_events_by_addr
        )

        return super().calculate_users_effective_deposits(payload)

    def _remove_unlock_and_lock_within_24_hours(
        self, events: LockEventsByAddr
    ) -> LockEventsByAddr:
        """
        Removes the unlock event from Sablier if it is followed by a lock event in Octant within 24 hours.
        """
        TWENTY_FOUR_HOURS_PERIOD = 24 * 60 * 60

        for address, user_events in events.items():
            if not user_events:
                continue

            filtered_events = []
            skip_next = False

            for prev_event, next_event in zip(user_events, user_events[1:]):
                if skip_next:
                    # Skip adding the next_event as it was part of a pair that should be ignored.
                    skip_next = False
                    continue

                if (
                    prev_event.source == DepositSource.SABLIER
                    and prev_event.type == EventType.UNLOCK
                    and next_event.source == DepositSource.OCTANT
                    and next_event.type == EventType.LOCK
                    and next_event.timestamp - prev_event.timestamp
                    < TWENTY_FOUR_HOURS_PERIOD
                ):
                    # Skip both the unlock and the following lock.
                    skip_next = True
                    continue

                filtered_events.append(prev_event)

            # Add the last event if it was not skipped.
            if not skip_next:
                filtered_events.append(user_events[-1])

            events[address] = filtered_events

        return events

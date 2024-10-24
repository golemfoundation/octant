from typing import Dict, List, Tuple
from datetime import datetime
from itertools import chain, repeat, accumulate

from app.engine.user.effective_deposit import DepositSource
from tests.helpers.constants import USER1_ADDRESS

EventDetails = Tuple[int, int]
EventDetailsWithSource = Tuple[int, int, DepositSource]


def generate_epoch_events(
    start=None, duration=1000, decision_window=500, first_epoch=1, epoches=5, **kwargs
):
    epoch_start = start if start is not None else datetime.utcnow()

    events = []

    for epoch_no in range(first_epoch, first_epoch + epoches):
        epoch_end = start + duration
        event = create_epoch_event(
            start=epoch_start,
            end=epoch_end,
            duration=duration,
            decision_window=decision_window,
            epoch=epoch_no,
            **kwargs,
        )
        events.append(event)
        epoch_start = epoch_end

    return events


# pass mapping user_address => [(timestamp, amount, source), ...]
def create_deposit_events(
    events: Dict[str, List[EventDetails | EventDetailsWithSource]]
):
    def flatten(list_of_lists):
        return list(chain(*list_of_lists))

    events = flatten(
        [create_user_deposit_events(*user_events) for user_events in events.items()]
    )

    return sorted(events, key=lambda event: event["timestamp"])


def create_user_deposit_events(user, events):
    events.sort(key=lambda event: event[0])  # sort by timestamp, for sanity

    events_and_deposits = zip(
        repeat(user),
        events,
        accumulate(map(lambda event: event[1], events), initial=0),
    )
    return list(map(_tuple_to_event_dict, events_and_deposits))


def _tuple_to_event_dict(tuple: Tuple[str, EventDetailsWithSource | EventDetails, int]):
    user, event, deposit_before = tuple
    return create_deposit_event(
        user=user,
        typename="Locked" if event[1] > 0 else "Unlocked",
        timestamp=event[0],
        amount=str(abs(event[1])),
        deposit_before=str(deposit_before),
        source=event[2] if len(event) == 3 else DepositSource.OCTANT,
    )


def create_deposit_event(
    user=USER1_ADDRESS,
    typename="Locked",
    deposit_before="0",
    amount="100000000000000000000",
    **kwargs,
):
    str_keys = ["depositBefore", "transactionHash", "user", "amount", "__typename"]
    int_keys = ["blockNumber", "timestamp"]

    event = {
        "__typename": typename,
        "depositBefore": deposit_before,
        "amount": amount,
        "user": user,
        **kwargs,
    }

    return _convert_values(event, str_keys, int_keys)


def create_epoch_event(
    start=1000, end=2000, duration=1000, decision_window=500, epoch=1, **kwargs
):
    str_keys = ["decisionWindow", "duration", "fromTs", "toTs"]
    int_keys = ["epoch"]

    event = {
        "epoch": epoch,
        "fromTs": start,
        "toTs": end,
        "duration": duration,
        "decisionWindow": decision_window,
        **kwargs,
    }

    return _convert_values(event, str_keys, int_keys)


def _convert_values(event_dict, str_keys, int_keys=None):
    int_keys = int_keys if int_keys is not None else []

    event = [(k, str(v)) for k, v in event_dict.items() if k in str_keys]
    event += [(k, int(v)) for k, v in event_dict.items() if k in int_keys]

    return dict(event)

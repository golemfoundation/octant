from copy import deepcopy
from typing import List

from app.engine.user.effective_deposit import DepositEvent, EventType, DepositSource


def _remove_redundant_events_within_grace_period(
    modified_events: List[DepositEvent], sablier_unlock_grace_period: int
) -> List[DepositEvent]:
    i = 0
    while i < len(modified_events) - 1:
        current_event = modified_events[i]
        next_event = modified_events[i + 1]

        is_unlock_lock_pair = (
            current_event.type == EventType.UNLOCK
            and next_event.type == EventType.LOCK
            and current_event.source == DepositSource.SABLIER
            and next_event.source == DepositSource.OCTANT
            and next_event.timestamp - current_event.timestamp
            < sablier_unlock_grace_period
        )

        if is_unlock_lock_pair:
            if current_event.amount == next_event.amount:
                del modified_events[i : i + 2]
                continue
            elif current_event.amount < next_event.amount:
                excessive_amount = next_event.amount - current_event.amount
                next_event.amount = excessive_amount
                next_event.deposit_before = current_event.deposit_before
                next_event.deposit_after = next_event.deposit_before + excessive_amount
                del modified_events[i]
                continue

        i += 1

    return modified_events


def unify_deposit_balances(
    events: List[DepositEvent], sablier_unlock_grace_period: int
) -> List[DepositEvent]:
    """
    Unify deposit balance for each event in the list of events. Events are expected to be sorted by timestamp.
    The first event is taken from deposits, but it already includes deposit from Sablier from the past.

    Returns:
        List[DepositEvent]: A list of events with adjusted `deposit_before` and `deposit_after`.
    """
    modified_events = deepcopy(events)

    acc_balance_sablier = 0
    acc_balance_octant = events[0].deposit_before  # balance from previous epoch

    for event in modified_events[1:]:
        combined_balance = acc_balance_sablier + acc_balance_octant
        event.deposit_before = combined_balance

        if event.type == EventType.LOCK:
            if event.source == DepositSource.SABLIER:
                acc_balance_sablier += event.amount
            else:
                acc_balance_octant += event.amount

            event.deposit_after = event.deposit_before + event.amount
        elif event.type == EventType.UNLOCK:
            if event.source == DepositSource.SABLIER:
                acc_balance_sablier -= event.amount
            else:
                acc_balance_octant -= event.amount

            event.deposit_after = event.deposit_before - event.amount

    modified_events_with_grace_period = _remove_redundant_events_within_grace_period(
        modified_events, sablier_unlock_grace_period
    )
    print(modified_events_with_grace_period, flush=True)
    return modified_events_with_grace_period

from copy import deepcopy
from typing import List

from app.engine.user.effective_deposit import DepositEvent, EventType, DepositSource


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

    i = 0
    while i < len(modified_events) - 1:
        current_event = modified_events[i]
        next_event = modified_events[i + 1]

        if current_event.type == EventType.UNLOCK and next_event.type == EventType.LOCK:
            if (
                current_event.source == DepositSource.SABLIER
                and next_event.source == DepositSource.OCTANT
                and next_event.timestamp - current_event.timestamp
                < sablier_unlock_grace_period
            ):
                unlocked_amount = current_event.amount
                locked_amount = next_event.amount

                if locked_amount == unlocked_amount:
                    # Scenario 1: Transparent unlock and lock
                    del modified_events[i : i + 2]
                    continue
                elif locked_amount > unlocked_amount:
                    # Scenario 3: Transparent unlock, only record the excess lock
                    excess_amount = locked_amount - unlocked_amount
                    next_event.amount = excess_amount
                    next_event.deposit_before = acc_balance_sablier + acc_balance_octant
                    next_event.deposit_after = next_event.deposit_before + excess_amount
                    del modified_events[i]  # Remove the unlock event
                    continue

        # Update balances for normal event processing
        combined_balance = acc_balance_sablier + acc_balance_octant
        current_event.deposit_before = combined_balance

        if current_event.type == EventType.LOCK:
            if current_event.source == DepositSource.SABLIER:
                acc_balance_sablier += current_event.amount
            else:
                acc_balance_octant += current_event.amount

            current_event.deposit_after = (
                current_event.deposit_before + current_event.amount
            )
        elif current_event.type == EventType.UNLOCK:
            if current_event.source == DepositSource.SABLIER:
                acc_balance_sablier -= current_event.amount
            else:
                acc_balance_octant -= current_event.amount

            current_event.deposit_after = (
                current_event.deposit_before - current_event.amount
            )

        i += 1

    # Process the last event
    if modified_events:
        last_event = modified_events[-1]
        combined_balance = acc_balance_sablier + acc_balance_octant
        last_event.deposit_before = combined_balance
        if last_event.type == EventType.LOCK:
            last_event.deposit_after = last_event.deposit_before + last_event.amount
        elif last_event.type == EventType.UNLOCK:
            last_event.deposit_after = last_event.deposit_before - last_event.amount

    return modified_events

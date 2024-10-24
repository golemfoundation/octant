from copy import deepcopy
from typing import List

from app.engine.user.effective_deposit import DepositEvent, EventType, DepositSource


def unify_deposit_balances(events: List[DepositEvent]) -> List[DepositEvent]:
    """
    Unify deposit balance for each event in the list of events. Events are expected to be sorted by timestamp.
    The first event is always from Octant, but the first Sablier event may have a non-zero `deposit_before`, indicating a balance from the past.

    Returns:
        List[DepositEvent]: A list of events with adjusted `deposit_before` and `deposit_after`.
    """
    modified_events = deepcopy(events)

    acc_balance_sablier = 0
    acc_balance_octant = events[0].deposit_before  # balance from previous epoch

    first_sablier_processed = False
    for event in modified_events[1:]:
        if event.source == DepositSource.SABLIER and not first_sablier_processed:
            acc_balance_sablier = event.deposit_before
            first_sablier_processed = True

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

    return modified_events

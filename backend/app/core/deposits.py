from eth_utils import to_checksum_address

from app import database
from app.database.models import User
from app.infrastructure import qraphql
from app.infrastructure.qraphql.locks import get_locks_by_timestamp_range
from app.infrastructure.qraphql.unlocks import get_unlocks_by_timestamp_range

from decimal import Decimal


CUT_OFF = 100 * 10**18


def calculate_locked_ratio(total_effective_deposit: int, glm_supply: int) -> Decimal:
    return Decimal(total_effective_deposit) / Decimal(glm_supply)


def update_db_deposits(epoch: int) -> int:
    events = _get_deposits_events(epoch)
    total_ed = 0
    previous_deposits = database.deposits.get_all_by_epoch(epoch - 1)

    # Update deposits based on previous epoch entries
    for deposit in previous_deposits:
        user = deposit.user
        user_events = events.get(user.address)

        if user_events:
            effective_deposit, epoch_end_deposit = _calculate_deposits(user_events)
            # Remove user events after calculations
            events.pop(user.address)
        else:
            effective_deposit = _apply_cutoff(int(deposit.epoch_end_deposit))
            epoch_end_deposit = int(deposit.epoch_end_deposit)

        _save_user_deposit(epoch, user, effective_deposit, epoch_end_deposit)
        total_ed += effective_deposit

    # Add entries to db for users who did not have entries from the previous epoch
    for user_address, user_events in events.items():
        user = database.user.get_or_add_user(user_address)
        epoch_end_deposit = _calculate_deposit_after_event(user_events[-1])
        _save_user_deposit(epoch, user, 0, epoch_end_deposit)

    return total_ed


def _get_deposits_events(epoch_num: int) -> dict:
    epoch = qraphql.epochs.get_epoch_by_number(epoch_num)
    start, end = epoch["fromTs"], epoch["toTs"]
    events = get_locks_by_timestamp_range(start, end) + get_unlocks_by_timestamp_range(
        start, end
    )

    events_by_user_addr = {}

    for event in events:
        event["depositBefore"] = int(event["depositBefore"])
        event["amount"] = int(event["amount"])
        user_address = to_checksum_address(event["user"])
        if user_address not in events_by_user_addr:
            events_by_user_addr[user_address] = []
        events_by_user_addr[user_address].append(event)

    for user_address, events in events_by_user_addr.items():
        events_by_user_addr[user_address] = sorted(events, key=lambda x: x["timestamp"])

    return events_by_user_addr


def _calculate_deposits(events: [dict]) -> (int, int):
    epoch_end_deposit = _calculate_deposit_after_event(events[-1])
    deposits_values = [event["depositBefore"] for event in events]
    deposits_values.append(epoch_end_deposit)
    effective_deposit = _apply_cutoff(min(deposits_values))

    return effective_deposit, epoch_end_deposit


def _calculate_deposit_after_event(event: dict) -> int:
    if event["__typename"] == "Locked":
        return event["depositBefore"] + event["amount"]
    else:
        return event["depositBefore"] - event["amount"]


def _save_user_deposit(
    epoch: int, user: User, effective_deposit: int, epoch_end_deposit: int
):
    if epoch_end_deposit > 0:
        database.deposits.add_deposit(epoch, user, effective_deposit, epoch_end_deposit)


def _apply_cutoff(amount: int) -> int:
    return amount if amount >= CUT_OFF else 0

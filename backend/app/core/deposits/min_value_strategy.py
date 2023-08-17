from typing import List, Tuple, Dict

from app import database
from app.core.common import UserDeposit
from app.core.deposits.cut_off import apply_min_value_cutoff
from app.core.deposits.events import get_all_users_weighted_deposits, WeightedDeposit
from app.database.models import Deposit

MINIMUM_DEPOSIT = 0


def get_user_deposits(epoch_no: int) -> Tuple[List[UserDeposit], int]:
    """
    Get the user deposits for a given epoch number as a minimal value strategy.

    Effective Deposit refers to Locked GLM that has been locked for a full epoch
    and is generating rewards.
    Consider locking 100 GLM in Epoch 2 and 1000 GLM in Epoch 3.
    During Epoch 3 Locked Balance will be 1100 GLM, but Effective Deposit will be 100 GLM,
    because the 1000 GLM has not been locked for a full epoch yet.

    During Epoch 3, rewards will be generated on the entire balance,
    so Effective Deposit will become 1100 GLM.

    Args:
        epoch_no: The epoch number for which to get the user deposits.

    Returns:
        A tuple of two elements:
            - A list of UserDeposit instances.
            - The total effective deposit.
    """
    previous_db_deposits = database.deposits.get_all_by_epoch(epoch_no - 1)
    epoch_deposits = get_all_users_weighted_deposits(epoch_no)
    total_effective_deposit = 0
    user_deposits = []

    # Combine all user addresses from previous and current epoch
    all_addresses = set(list(previous_db_deposits.keys()) + list(epoch_deposits.keys()))

    for address in all_addresses:
        user_deposit, effective_deposit = handle_deposit(
            address, previous_db_deposits, epoch_deposits
        )
        if user_deposit is not None:
            user_deposits.append(user_deposit)
            total_effective_deposit += effective_deposit

    return user_deposits, total_effective_deposit


def handle_deposit(
    address,
    previous_db_deposits: Dict[str, Deposit],
    epoch_deposits: Dict[str, List[WeightedDeposit]],
):
    deposits_events = epoch_deposits.get(address)
    previous_deposit = previous_db_deposits.get(address, None)
    effective_deposit = 0
    epoch_end_deposit = 0

    if deposits_events:
        effective_deposit = _calculate_effective_deposit(deposits_events)
        epoch_end_deposit = deposits_events[-1].amount
    elif previous_deposit:
        effective_deposit = apply_min_value_cutoff(
            int(previous_deposit.epoch_end_deposit)
        )
        epoch_end_deposit = int(previous_deposit.epoch_end_deposit)

    if epoch_end_deposit > MINIMUM_DEPOSIT:
        return (
            UserDeposit(address, effective_deposit, epoch_end_deposit),
            effective_deposit,
        )
    return None, 0


def _calculate_effective_deposit(deposits: List[WeightedDeposit]) -> int:
    return apply_min_value_cutoff(min([amount for amount, _ in deposits]))

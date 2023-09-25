from decimal import Decimal
from typing import List

from app import database
from app.core import glm
from app.core.common import AccountFunds
from app.core.deposits.deposits import calculate_locked_ratio
from app.core.deposits.events import SimulatedEventsGenerator
from app.core.deposits.weighted_deposits import get_user_weighted_deposits
from app.core.epochs.details import EpochDetails
from app.core.epochs.epochs_registry import EpochsRegistry
from app.core.rewards.rewards import estimate_epoch_eth_staking_proceeds
from app.crypto.terms_and_conditions_consent import (
    verify_signed_message,
)
from app.exceptions import DuplicateConsent, InvalidSignature
from app.core.epochs import details as epochs_details
from app.core.deposits import deposits as deposits_core
from app.extensions import epochs
from app.utils.time import days_to_sec


def get_budget(user_address: str, epoch: int) -> int:
    snapshot = database.pending_epoch_snapshot.get_by_epoch_num(epoch)
    deposit = database.deposits.get_by_user_address_and_epoch(user_address, epoch)

    if snapshot is None or deposit is None or Decimal(deposit.effective_deposit) == 0:
        return 0

    individual_share = Decimal(deposit.effective_deposit) / Decimal(
        snapshot.total_effective_deposit
    )

    return int(Decimal(snapshot.all_individual_rewards) * individual_share)


def estimate_budget(days: int, glm_amount: int) -> int:
    epoch_num = epochs.get_current_epoch()
    epoch = epochs_details.get_epoch_details(epoch_num)
    lock_duration = days_to_sec(days)
    budget = 0

    while lock_duration > 0:
        eth_proceeds = estimate_epoch_eth_staking_proceeds(epoch.duration_days)
        locked_ratio = _estimate_locked_ratio(epoch, glm_amount, lock_duration)
        epoch_registry = EpochsRegistry.get_epoch_settings(epoch_num)
        rewards = epoch_registry.rewardsStrategy.calculate_all_individual_rewards(
            eth_proceeds, locked_ratio
        )

        budget += rewards
        lock_duration -= epoch.remaining_sec
        epoch_num += 1
        epoch = epochs_details.get_future_epoch_details()

    return budget


def get_claimed_rewards(epoch: int) -> (List[AccountFunds], int):
    rewards_sum = 0
    rewards = []

    for allocation in database.allocations.get_alloc_sum_by_epoch_and_user_address(
        epoch
    ):
        user_budget = get_budget(allocation.address, epoch)
        claimed_rewards = user_budget - allocation.amount
        if claimed_rewards > 0:
            rewards.append(AccountFunds(allocation.address, claimed_rewards))
            rewards_sum += claimed_rewards

    return rewards, rewards_sum


def has_user_agreed_to_terms_of_service(user_address: str) -> bool:
    consent = database.user_consents.get_last_by_address(user_address)
    return consent is not None


def add_user_terms_of_service_consent(
    user_address: str, consent_signature: str, ip_address: str
):
    if has_user_agreed_to_terms_of_service(user_address):
        raise DuplicateConsent(user_address)

    if not verify_signed_message(user_address, consent_signature):
        raise InvalidSignature(user_address, consent_signature)

    database.user_consents.add_consent(user_address, ip_address)


def _estimate_locked_ratio(
    epoch: EpochDetails, amount: int, lock_duration: int
) -> Decimal:
    events_generator = SimulatedEventsGenerator(
        epoch.start_sec, epoch.end_sec, lock_duration, amount, epoch.remaining_sec
    )
    deposits = get_user_weighted_deposits(events_generator)
    effective_deposit = deposits_core.estimate_effective_deposit(deposits)
    return calculate_locked_ratio(effective_deposit, glm.get_current_glm_supply())

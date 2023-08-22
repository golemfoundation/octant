from decimal import Decimal
from typing import List

from app import database
from app.core.common import AccountFunds
from app.crypto.terms_and_conditions_consent import verify_signed_message
from app.exceptions import DuplicateConsent, InvalidSignature


def get_budget(user_address: str, epoch: int) -> int:
    snapshot = database.pending_epoch_snapshot.get_by_epoch_num(epoch)
    deposit = database.deposits.get_by_user_address_and_epoch(user_address, epoch)

    if snapshot is None or deposit is None or Decimal(deposit.effective_deposit) == 0:
        return 0

    individual_share = Decimal(deposit.effective_deposit) / Decimal(
        snapshot.total_effective_deposit
    )

    return int(Decimal(snapshot.all_individual_rewards) * individual_share)


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

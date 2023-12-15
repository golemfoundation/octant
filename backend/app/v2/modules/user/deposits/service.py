from dataclasses import dataclass
from typing import Tuple, List

from flask import current_app as app

from app.core.deposits.events import EventGenerator
from app.exceptions import EffectiveDepositNotFoundException
from app.v2.context.context import EpochContext, CurrentEpochContext, Context
from app.v2.engine.user.effective_deposit import (
    UserDeposit,
    UserEffectiveDepositPayload,
)


@dataclass
class UserDepositsCalculator:
    events_generator: EventGenerator

    def calculate_all_effective_deposits(
        self, context: EpochContext
    ) -> Tuple[List[UserDeposit], int]:
        epoch_details = context.epoch_details
        start = epoch_details.start_sec
        end = epoch_details.end_sec
        events = self.events_generator.get_all_users_events()
        app.logger.debug(
            f"Calculating effective deposits for epoch {epoch_details.epoch_no}"
        )

        effective_deposit_calculator = context.epoch_settings.user.effective_deposit

        return effective_deposit_calculator.calculate_users_effective_deposits(
            UserEffectiveDepositPayload(
                epoch_start=start, epoch_end=end, lock_events_by_addr=events
            )
        )

    def calculate_effective_deposit(
        self, context: EpochContext, user_address: str
    ) -> UserDeposit:
        epoch_details = context.epoch_details
        start = epoch_details.start_sec
        end = epoch_details.end_sec
        events = {user_address: self.events_generator.get_user_events(user_address)}
        app.logger.debug(
            f"Calculating effective deposits for user {user_address} in epoch {epoch_details.epoch_no}"
        )

        effective_deposit_calculator = context.epoch_settings.user.effective_deposit

        (
            user_deposits,
            _,
        ) = effective_deposit_calculator.calculate_users_effective_deposits(
            UserEffectiveDepositPayload(
                epoch_start=start, epoch_end=end, lock_events_by_addr=events
            )
        )
        return user_deposits[0]


@dataclass
class UserDepositsEstimator:
    user_deposits_calculator: UserDepositsCalculator

    def estimate_total_effective_deposit(self, context: CurrentEpochContext) -> int:
        _, total = self.user_deposits_calculator.calculate_all_effective_deposits(
            context
        )
        return total

    def estimate_user_effective_deposit(
        self, context: CurrentEpochContext, user_address: str
    ) -> int:
        user_deposit = self.user_deposits_calculator.calculate_effective_deposit(
            context, user_address
        )
        return user_deposit.effective_deposit


@dataclass
class UserDepositsReader:
    def get_user_effective_deposit(
        self, context: Context, user_address: str, epoch: int
    ) -> int:
        user = context.users_context[user_address]
        effective_deposit = user.get_effective_deposit(epoch)
        if effective_deposit is None:
            raise EffectiveDepositNotFoundException(epoch, user_address)

        return effective_deposit

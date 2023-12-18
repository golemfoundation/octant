from dataclasses import dataclass
from typing import Tuple, List

from flask import current_app as app

from app.exceptions import EffectiveDepositNotFoundException
from app.extensions import glm
from app.v2.context.context import EpochContext, CurrentEpochContext, Context
from app.v2.engine.user.effective_deposit import (
    UserDeposit,
    UserEffectiveDepositPayload,
)
from app.v2.modules.user.deposits.events_generator import EventsGenerator


@dataclass
class UserDepositsCalculator:
    events_generator: EventsGenerator

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
        self, context: EpochContext, user_address: str = None
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

    def estimate_effective_deposit(
        self, context: EpochContext, glm_amount: int, lock_duration_sec: int
    ) -> int:
        events_generator = self.user_deposits_calculator.events_generator
        events_generator.update_epoch(
            context.epoch_details.start_sec, context.epoch_details.end_sec
        )
        events_generator.create_user_events(
            glm_amount=glm_amount,
            lock_duration_sec=lock_duration_sec,
            epoch_remaining_duration_sec=context.epoch_details.remaining_sec,
        )
        user_deposit = self.user_deposits_calculator.calculate_effective_deposit(
            context
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

    def get_total_deposited(self) -> int:
        return glm.balance_of(app.config["DEPOSITS_CONTRACT_ADDRESS"])

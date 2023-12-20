from abc import ABC
from dataclasses import dataclass
from typing import Tuple, List

from flask import current_app as app

from app.v2.context.context import EpochContext
from app.v2.engine.user.effective_deposit import (
    UserDeposit,
    UserEffectiveDepositPayload,
)
from app.v2.modules.user.deposits.service.events_generator import EventsGenerator


@dataclass
class UserDepositsCalculator(ABC):
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

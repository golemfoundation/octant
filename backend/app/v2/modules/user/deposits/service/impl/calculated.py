from dataclasses import dataclass
from typing import Tuple, List

from app.v2.context.context import Context
from app.v2.engine.user.effective_deposit import UserDeposit
from app.v2.modules.user.common import calculate_effective_deposits
from app.v2.modules.user.events_generator.service.service import EventsGenerator


@dataclass
class CalculatedUserDeposits:
    events_generator: EventsGenerator

    def get_all_effective_deposits(
        self, context: Context
    ) -> Tuple[List[UserDeposit], int]:
        events = self.events_generator.get_all_users_events(context)
        return calculate_effective_deposits(
            context.epoch_details, context.epoch_settings, events
        )

    def get_total_effective_deposit(self, context: Context) -> int:
        events = self.events_generator.get_all_users_events(context)
        _, total = calculate_effective_deposits(
            context.epoch_details, context.epoch_settings, events
        )
        return total

    def get_user_effective_deposit(self, context: Context, user_address: str) -> int:
        events = {
            user_address: self.events_generator.get_user_events(context, user_address)
        }
        deposits, _ = calculate_effective_deposits(
            context.epoch_details, context.epoch_settings, events
        )
        return deposits[0].effective_deposit

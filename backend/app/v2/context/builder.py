from dataclasses import dataclass
from typing import List

from app import database
from app.v2.context.context import Context
from app.v2.context.epoch_details import get_epoch_details
from app.v2.context.epoch_state import EpochState, get_epoch_state, get_epoch_number
from app.v2.engine.epochs_settings import get_epoch_settings
from app.v2.modules.octant_rewards.service.factory import get_octant_rewards_service


@dataclass
class ContextBuilder:
    context: Context

    @staticmethod
    def from_epoch_num(epoch_num: int):
        epoch_state = get_epoch_state(epoch_num)
        _get_context_builder(epoch_num, epoch_state)

    @staticmethod
    def from_epoch_state(epoch_state: EpochState):
        epoch_num = get_epoch_number(epoch_state)
        _get_context_builder(epoch_num, epoch_state)

    def with_octant_rewards(self):
        service = get_octant_rewards_service(self.context.epoch_state)
        rewards = service.get_octant_rewards(self.context)
        self.context.octant_rewards = rewards
        return self

    def with_users(self, users_addresses: List[str]):
        users_context = database.user.get_by_users_addresses(users_addresses)
        self.context.users_context = users_context
        return self

    def build(self) -> Context:
        return self.context


def _get_context_builder(epoch_num: int, epoch_state: EpochState) -> ContextBuilder:
    epoch_details = get_epoch_details(epoch_num, epoch_state)
    epoch_settings = get_epoch_settings(epoch_num)
    context = Context(
        epoch_state=epoch_state,
        epoch_details=epoch_details,
        epoch_settings=epoch_settings,
    )
    return ContextBuilder(context=context)

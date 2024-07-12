from decimal import Decimal
from typing import Protocol, runtime_checkable

from app.context.manager import Context
from app.engine.octant_rewards.matched import MatchedRewardsPayload
from app.infrastructure import database
from app.pydantic import Model


@runtime_checkable
class UserPatronMode(Protocol):
    def get_patrons_rewards(self, context: Context) -> int:
        ...


class PendingOctantMatchedRewards(Model):
    patrons_mode: UserPatronMode

    def get_matched_rewards(self, context: Context) -> int:
        pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(
            context.epoch_details.epoch_num
        )
        patrons_rewards = self.patrons_mode.get_patrons_rewards(context)
        matched_rewards_settings = context.epoch_settings.octant_rewards.matched_rewards

        return matched_rewards_settings.calculate_matched_rewards(
            MatchedRewardsPayload(
                total_rewards=int(pending_snapshot.total_rewards),
                vanilla_individual_rewards=int(
                    pending_snapshot.vanilla_individual_rewards
                ),
                patrons_rewards=patrons_rewards,
                staking_proceeds=int(pending_snapshot.eth_proceeds),
                locked_ratio=Decimal(pending_snapshot.locked_ratio),
                ire_percent=context.epoch_settings.octant_rewards.total_and_vanilla_individual_rewards.IRE_PERCENT,
                tr_percent=context.epoch_settings.octant_rewards.total_and_vanilla_individual_rewards.TR_PERCENT,
            )
        )

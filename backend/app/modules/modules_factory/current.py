from dataclasses import dataclass
from typing import Protocol

from app.modules.modules_factory.protocols import (
    OctantRewards,
    UserEffectiveDeposits,
    TotalEffectiveDeposits,
)
from app.modules.octant_rewards.service.calculated import CalculatedOctantRewards
from app.modules.staking.proceeds.service.estimated import EstimatedStakingProceeds
from app.modules.user.deposits.service.calculated import CalculatedUserDeposits
from app.modules.user.events_generator.service.db_and_graph import (
    DbAndGraphEventsGenerator,
)


class CurrentUserDeposits(UserEffectiveDeposits, TotalEffectiveDeposits, Protocol):
    pass


@dataclass(frozen=True)
class CurrentServices:
    user_deposits_service: CurrentUserDeposits
    octant_rewards_service: OctantRewards

    @staticmethod
    def create() -> "CurrentServices":
        user_deposits = CalculatedUserDeposits(
            events_generator=DbAndGraphEventsGenerator()
        )
        return CurrentServices(
            user_deposits_service=user_deposits,
            octant_rewards_service=CalculatedOctantRewards(
                staking_proceeds=EstimatedStakingProceeds(),
                effective_deposits=user_deposits,
            ),
        )

from collections import defaultdict
from dataclasses import dataclass, field

from app.engine.octant_rewards import OctantRewardsSettings
from app.engine.octant_rewards.total_and_individual.all_proceeds_with_op_cost import (
    AllProceedsWithOperationalCost,
)
from app.engine.projects import ProjectSettings
from app.engine.user import UserSettings, DefaultWeightedAverageEffectiveDeposit
from app.engine.user.effective_deposit.weighted_average.weights.timebased.default import (
    DefaultTimebasedWeights,
)


@dataclass
class EpochSettings:
    octant_rewards: OctantRewardsSettings = field(default_factory=OctantRewardsSettings)
    user: UserSettings = field(default_factory=UserSettings)
    project: ProjectSettings = field(default_factory=ProjectSettings)


SETTINGS: dict[int, EpochSettings] = defaultdict(lambda: EpochSettings())


def get_epoch_settings(epoch_number: int) -> EpochSettings:
    return SETTINGS[epoch_number]


def register_epoch_settings():
    SETTINGS[1] = EpochSettings(
        octant_rewards=OctantRewardsSettings(
            total_and_all_individual_rewards=AllProceedsWithOperationalCost(),
        ),
        user=UserSettings(
            effective_deposit=DefaultWeightedAverageEffectiveDeposit(
                timebased_weights=DefaultTimebasedWeights(),
            ),
        ),
    )

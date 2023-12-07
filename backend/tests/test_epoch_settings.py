from app.v2.engine.epochs_settings import get_epoch_settings, register_epoch_settings
from app.v2.engine.octant_rewards import DefaultLockedRatio, DefaultMatchedRewards
from app.v2.engine.octant_rewards.total_and_individual.all_proceeds_with_op_cost import (
    AllProceedsWithOperationalCost,
)
from app.v2.engine.projects import DefaultProjectRewards, DefaultProjectThreshold
from app.v2.engine.user import DefaultUserBudget
from app.v2.engine.user.effective_deposit import (
    TimebasedWithoutUnlocksWeights,
    CutOff10GLM,
)
from app.v2.engine.user.effective_deposit.weighted_average.weights.timebased.default import (
    DefaultTimebasedWeights,
)


def test_epoch_1_settings():
    register_epoch_settings()
    settings = get_epoch_settings(1)

    assert settings.octant_rewards.locked_ratio == DefaultLockedRatio()
    assert (
        settings.octant_rewards.total_and_all_individual_rewards
        == AllProceedsWithOperationalCost()
    )
    assert settings.octant_rewards.matched_rewards == DefaultMatchedRewards()

    assert settings.user.budget == DefaultUserBudget()
    assert settings.user.effective_deposit.cut_off == CutOff10GLM()
    assert (
        settings.user.effective_deposit.timebased_weights == DefaultTimebasedWeights()
    )

    assert settings.project.rewards == DefaultProjectRewards()
    assert settings.project.threshold == DefaultProjectThreshold()

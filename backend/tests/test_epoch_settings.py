from app.v2.engine.epochs_settings import get_epoch_settings, register_epoch_settings
from app.v2.engine.octant_rewards import (
    DefaultLockedRatio,
    DefaultMatchedRewards,
    DefaultTotalAndAllIndividualRewards,
)
from app.v2.engine.octant_rewards.total_and_individual.all_proceeds_with_op_cost import (
    AllProceedsWithOperationalCost,
)
from app.v2.engine.projects import DefaultProjectRewards, DefaultProjectThreshold
from app.v2.engine.user import DefaultUserBudget
from app.v2.engine.user.effective_deposit import (
    CutOff10GLM,
    TimebasedWithoutUnlocksWeights,
)
from app.v2.engine.user.effective_deposit.weighted_average.weights.timebased.default import (
    DefaultTimebasedWeights,
)


def test_default_epoch_settings():
    register_epoch_settings()
    settings = get_epoch_settings(-1)
    check_settings(
        settings,
        total_and_all_individual_rewards=DefaultTotalAndAllIndividualRewards,
        timebased_weights=TimebasedWithoutUnlocksWeights,
    )


def test_epoch_1_settings():
    register_epoch_settings()
    settings = get_epoch_settings(1)
    check_settings(
        settings,
        total_and_all_individual_rewards=AllProceedsWithOperationalCost,
        timebased_weights=DefaultTimebasedWeights,
    )


def test_epoch_2_settings():
    register_epoch_settings()
    settings = get_epoch_settings(2)
    check_settings(
        settings,
        total_and_all_individual_rewards=DefaultTotalAndAllIndividualRewards,
        timebased_weights=TimebasedWithoutUnlocksWeights,
    )


def check_settings(settings, **kwargs):
    assert settings.octant_rewards.locked_ratio == DefaultLockedRatio()
    assert settings.octant_rewards.matched_rewards == DefaultMatchedRewards()
    assert settings.user.budget == DefaultUserBudget()
    assert settings.user.effective_deposit.cut_off == CutOff10GLM()
    assert settings.project.rewards == DefaultProjectRewards()
    assert settings.project.threshold == DefaultProjectThreshold()

    assert (
        settings.octant_rewards.total_and_all_individual_rewards
        == kwargs["total_and_all_individual_rewards"]()
    )
    assert (
        settings.user.effective_deposit.timebased_weights
        == kwargs["timebased_weights"]()
    )

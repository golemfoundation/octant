from decimal import Decimal

from app.engine.epochs_settings import get_epoch_settings, register_epoch_settings
from app.engine.octant_rewards import CommunityFundPercent, OctantRewardsDefaultValues
from app.engine.octant_rewards import (
    DefaultLockedRatio,
)
from app.engine.octant_rewards import OpCostPercent
from app.engine.octant_rewards.community_fund.not_supported import (
    NotSupportedCFCalculator,
)
from app.engine.octant_rewards.matched.percentage_from_staking import (
    PercentageMatchedRewards,
)
from app.engine.octant_rewards.matched.preliminary import PreliminaryMatchedRewards
from app.engine.octant_rewards.ppf.calculator import PPFCalculatorFromRewards
from app.engine.octant_rewards.ppf.not_supported import NotSupportedPPFCalculator
from app.engine.octant_rewards.total_and_individual.all_proceeds_with_op_cost import (
    AllProceedsWithOperationalCost,
)
from app.engine.octant_rewards.total_and_individual.preliminary import (
    PreliminaryTotalAndAllIndividualRewards,
)
from app.engine.octant_rewards.total_and_individual.tr_percent_calc import (
    PercentTotalAndAllIndividualRewards,
)
from app.engine.projects.rewards.allocations.preliminary import (
    PreliminaryProjectAllocations,
)
from app.engine.projects.rewards.allocations.quadratic_funding import (
    QuadraticFundingAllocations,
)
from app.engine.projects.rewards.preliminary import PreliminaryProjectRewards
from app.engine.projects.rewards.threshold.preliminary import (
    PreliminaryProjectThreshold,
)
from app.engine.user import (
    DefaultWeightedAverageEffectiveDeposit,
)
from app.engine.user.budget.preliminary import PreliminaryUserBudget
from app.engine.user.budget.with_ppf import UserBudgetWithPPF
from app.engine.user.effective_deposit.cut_off.cutoff_10glm import CutOff10GLM
from app.engine.user.effective_deposit.weighted_average.weights.timebased.default import (
    DefaultTimebasedWeights,
)
from app.engine.user.effective_deposit.weighted_average.weights.timebased.without_unlocks import (
    TimebasedWithoutUnlocksWeights,
)
from app.engine.projects.rewards.capped_quadratic_funding import (
    CappedQuadraticFundingProjectRewards,
)
from app.engine.octant_rewards import LeftoverWithPPFAndUnusedMR
from app.engine.octant_rewards.leftover.with_ppf import LeftoverWithPPF
from app.engine.octant_rewards.leftover.default import PreliminaryLeftover


def test_default_epoch_settings():
    register_epoch_settings()
    settings = get_epoch_settings(-1)
    check_settings(
        settings=settings,
        total_and_vanilla_individual_rewards=PercentTotalAndAllIndividualRewards(
            IRE_PERCENT=OctantRewardsDefaultValues.IRE_PERCENT,
            TR_PERCENT=OctantRewardsDefaultValues.TR_PERCENT,
        ),
        timebased_weights=TimebasedWithoutUnlocksWeights(),
        operational_cost=OpCostPercent(Decimal("0.25")),
        ppf=PPFCalculatorFromRewards(),
        community_fund=CommunityFundPercent(OctantRewardsDefaultValues.COMMUNITY_FUND),
        user_budget=UserBudgetWithPPF(),
        matched_rewards=PercentageMatchedRewards(
            OctantRewardsDefaultValues.MATCHED_REWARDS_PERCENT
        ),
        projects_rewards=CappedQuadraticFundingProjectRewards(),
        projects_allocations=QuadraticFundingAllocations(),
        leftover=LeftoverWithPPFAndUnusedMR(),
    )


def test_epoch_1_settings():
    register_epoch_settings()
    settings = get_epoch_settings(1)
    check_settings(
        settings=settings,
        total_and_vanilla_individual_rewards=AllProceedsWithOperationalCost(),
        timebased_weights=DefaultTimebasedWeights(),
        operational_cost=OpCostPercent(Decimal("0.20")),
        matched_rewards=PreliminaryMatchedRewards(),
        ppf=NotSupportedPPFCalculator(),
        community_fund=NotSupportedCFCalculator(),
        user_budget=PreliminaryUserBudget(),
        projects_rewards=PreliminaryProjectRewards(
            projects_threshold=PreliminaryProjectThreshold(2),
        ),
        projects_allocations=PreliminaryProjectAllocations(),
        leftover=PreliminaryLeftover(),
    )


def test_epoch_2_settings():
    register_epoch_settings()
    settings = get_epoch_settings(2)
    check_settings(
        settings=settings,
        total_and_vanilla_individual_rewards=PreliminaryTotalAndAllIndividualRewards(),
        timebased_weights=TimebasedWithoutUnlocksWeights(),
        operational_cost=OpCostPercent(Decimal("0.25")),
        matched_rewards=PreliminaryMatchedRewards(),
        ppf=NotSupportedPPFCalculator(),
        community_fund=NotSupportedCFCalculator(),
        user_budget=PreliminaryUserBudget(),
        projects_rewards=PreliminaryProjectRewards(
            projects_threshold=PreliminaryProjectThreshold(2),
        ),
        projects_allocations=PreliminaryProjectAllocations(),
        leftover=PreliminaryLeftover(),
    )


def test_epoch_3_settings():
    register_epoch_settings()
    settings = get_epoch_settings(3)

    check_settings(
        settings=settings,
        operational_cost=OpCostPercent(Decimal("0.25")),
        total_and_vanilla_individual_rewards=PercentTotalAndAllIndividualRewards(
            IRE_PERCENT=OctantRewardsDefaultValues.IRE_PERCENT,
            TR_PERCENT=OctantRewardsDefaultValues.TR_PERCENT,
        ),
        matched_rewards=PercentageMatchedRewards(
            OctantRewardsDefaultValues.MATCHED_REWARDS_PERCENT
        ),
        timebased_weights=TimebasedWithoutUnlocksWeights(),
        community_fund=CommunityFundPercent(OctantRewardsDefaultValues.COMMUNITY_FUND),
        ppf=PPFCalculatorFromRewards(),
        user_budget=UserBudgetWithPPF(),
        projects_rewards=PreliminaryProjectRewards(
            projects_threshold=PreliminaryProjectThreshold(1),
        ),
        projects_allocations=PreliminaryProjectAllocations(),
        leftover=LeftoverWithPPF(),
    )


def test_epoch_4_settings():
    register_epoch_settings()
    settings = get_epoch_settings(4)

    check_settings(
        settings=settings,
        operational_cost=OpCostPercent(Decimal("0.25")),
        total_and_vanilla_individual_rewards=PercentTotalAndAllIndividualRewards(
            IRE_PERCENT=OctantRewardsDefaultValues.IRE_PERCENT,
            TR_PERCENT=OctantRewardsDefaultValues.TR_PERCENT,
        ),
        matched_rewards=PercentageMatchedRewards(
            OctantRewardsDefaultValues.MATCHED_REWARDS_PERCENT
        ),
        timebased_weights=TimebasedWithoutUnlocksWeights(),
        community_fund=CommunityFundPercent(OctantRewardsDefaultValues.COMMUNITY_FUND),
        ppf=PPFCalculatorFromRewards(),
        user_budget=UserBudgetWithPPF(),
        projects_rewards=CappedQuadraticFundingProjectRewards(
            projects_allocations=QuadraticFundingAllocations(),
        ),
        projects_allocations=QuadraticFundingAllocations(),
        leftover=LeftoverWithPPFAndUnusedMR(),
    )


def check_settings(
    *,
    settings,
    total_and_vanilla_individual_rewards,
    operational_cost,
    timebased_weights,
    matched_rewards,
    ppf,
    community_fund,
    user_budget,
    projects_rewards,
    projects_allocations,
    leftover
):
    assert settings.octant_rewards.locked_ratio == DefaultLockedRatio()
    assert (
        settings.octant_rewards.total_and_vanilla_individual_rewards
        == total_and_vanilla_individual_rewards
    )
    assert settings.octant_rewards.operational_cost == operational_cost
    assert settings.octant_rewards.matched_rewards == matched_rewards
    assert settings.octant_rewards.ppf == ppf
    assert settings.octant_rewards.community_fund == community_fund
    assert settings.octant_rewards.leftover == leftover

    assert settings.user.budget == user_budget
    assert settings.user.effective_deposit.cut_off == CutOff10GLM()
    assert settings.user.effective_deposit == DefaultWeightedAverageEffectiveDeposit(
        timebased_weights=timebased_weights
    )

    assert settings.project.rewards == projects_rewards
    assert settings.project.rewards.projects_allocations == projects_allocations

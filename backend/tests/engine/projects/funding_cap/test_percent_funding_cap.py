from app.engine.projects.rewards.funding_cap.percent import FundingCapPercentCalculator
from tests.helpers.constants import MR_FUNDING_CAP_PERCENT


def test_applying_percent_funding_cap_when_none_exceeds_cap(
    matched_rewards_with_no_capped_distribution,
):
    (
        MATCHED_REWARDS,
        allocations,
        expected_distribution,
    ) = matched_rewards_with_no_capped_distribution

    calculator = FundingCapPercentCalculator(MR_FUNDING_CAP_PERCENT)

    capped_distribution = calculator.apply_capped_distribution(
        allocations, MATCHED_REWARDS
    )

    assert capped_distribution == expected_distribution


def test_applying_percent_funding_cap_calculations_when_exceeds_cap(
    matched_rewards_with_capped_distribution,
):
    (
        MATCHED_REWARDS,
        computed_matched_rewards,
        expected_distribution,
    ) = matched_rewards_with_capped_distribution

    calculator = FundingCapPercentCalculator(MR_FUNDING_CAP_PERCENT)

    capped_distribution = calculator.apply_capped_distribution(
        computed_matched_rewards, MATCHED_REWARDS
    )

    assert capped_distribution == expected_distribution

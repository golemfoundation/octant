from app.engine.projects.rewards.funding_cap.percent import FundingCapPercentCalculator
from tests.helpers.constants import MR_FUNDING_CAP_PERCENT


def test_percent_funding_cap_when_none_exceeds_cap(
    dataset_2_for_capped_quadratic_funding,
):
    (
        matched_rewards,
        allocations,
        expected_distribution,
    ) = dataset_2_for_capped_quadratic_funding

    calculator = FundingCapPercentCalculator(MR_FUNDING_CAP_PERCENT)

    capped_distribution = calculator.apply_capped_distribution(
        allocations, matched_rewards
    )

    assert capped_distribution == expected_distribution


def test_percent_funding_cap_calculations_when_exceeds_cap(
    dataset_1_for_capped_quadratic_funding,
):
    (
        matched_rewards,
        allocations,
        expected_distribution,
    ) = dataset_1_for_capped_quadratic_funding

    calculator = FundingCapPercentCalculator(MR_FUNDING_CAP_PERCENT)

    capped_distribution = calculator.apply_capped_distribution(
        allocations, matched_rewards
    )

    assert capped_distribution == expected_distribution

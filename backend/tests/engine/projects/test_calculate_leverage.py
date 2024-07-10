from decimal import Decimal

import pytest
from tests.helpers.context import get_context


@pytest.mark.parametrize(
    "matched, allocated, expected",
    [
        (300, 100, 3),
        (300, 0, 0),
    ],
)
def test_calculate_leverage(matched, allocated, expected):
    context = get_context()

    result = context.epoch_settings.project.rewards.leverage.calculate_leverage(
        matched, allocated
    )
    assert result == expected


@pytest.mark.parametrize(
    "before_capped_matched_rewards, actual_capped_matched, project_addresses, user_new_allocations, expected",
    [
        (
            {
                "0xBcd4042DE499D14e55001CcbB24a551F3b954096": Decimal(
                    "44022879663100249681.4"
                )
            },
            {
                "0xBcd4042DE499D14e55001CcbB24a551F3b954096": Decimal(
                    "44022879663100249681.4"
                )
            },
            [],
            0,
            0.0,
        ),
        (
            {},
            {
                "0x71bE63f3384f5fb98995898A86B02Fb2426c5788": Decimal(
                    "44022879663100249681.4"
                )
            },
            ["0x71bE63f3384f5fb98995898A86B02Fb2426c5788"],
            200000000000,
            220114398.31550124,
        ),
    ],
)
def test_calculate_individual_leverage(
    before_capped_matched_rewards,
    actual_capped_matched,
    project_addresses,
    user_new_allocations,
    expected,
):
    """
    The concept of the individual leverage has been introduced in the Epoch4 with such new concepts as: QF, UQ and Capped Matched Rewards.
    That's why we had to divide the leverage calculation into two separate functions: calculate_leverage (a global one) and calculate_individual_leverage (including UQ and Capped MR).
    """
    context = get_context(epoch_num=4)

    result = (
        context.epoch_settings.project.rewards.leverage.calculate_individual_leverage(
            before_capped_matched_rewards,
            actual_capped_matched,
            project_addresses,
            user_new_allocations,
        )
    )

    assert result == expected

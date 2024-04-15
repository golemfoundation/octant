import pytest

from app.modules.dto import AccountFundsDTO
from app.modules.user.rewards.service.calculated import CalculatedUserRewards
from tests.helpers.constants import USER3_BUDGET, USER1_BUDGET, USER2_BUDGET
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_get_unused_rewards(
    carol, mock_user_budgets, mock_user_allocations, mock_patron_mode
):
    context = get_context(1)

    service = CalculatedUserRewards(
        user_budgets=mock_user_budgets,
        allocations=mock_user_allocations,
        patrons_mode=mock_patron_mode,
    )

    result = service.get_unused_rewards(context)

    assert result == {carol.address: USER3_BUDGET}


def test_get_claimed_rewards(
    alice, bob, mock_user_budgets, mock_user_allocations, mock_patron_mode
):
    mock_user_allocations.get_all_users_with_allocations_sum.return_value = [
        AccountFundsDTO(alice.address, 100_000000000),
        AccountFundsDTO(bob.address, 200_000000000),
    ]

    context = get_context(1)

    service = CalculatedUserRewards(
        user_budgets=mock_user_budgets,
        allocations=mock_user_allocations,
        patrons_mode=mock_patron_mode,
    )

    claimed_rewards, claimed_rewards_sum = service.get_claimed_rewards(context)

    assert claimed_rewards == [
        AccountFundsDTO(address=alice.address, amount=USER1_BUDGET - 100_000000000),
        AccountFundsDTO(address=bob.address, amount=USER2_BUDGET - 200_000000000),
    ]
    assert claimed_rewards_sum == USER1_BUDGET + USER2_BUDGET - 300_000000000


def test_get_claimed_rewards_when_all_budget_is_allocated(
    alice, bob, mock_user_budgets, mock_user_allocations, mock_patron_mode
):
    mock_user_allocations.get_all_users_with_allocations_sum.return_value = [
        AccountFundsDTO(alice.address, USER1_BUDGET),
    ]

    context = get_context(1)

    service = CalculatedUserRewards(
        user_budgets=mock_user_budgets,
        allocations=mock_user_allocations,
        patrons_mode=mock_patron_mode,
    )

    claimed_rewards, claimed_rewards_sum = service.get_claimed_rewards(context)

    assert claimed_rewards == []
    assert claimed_rewards_sum == 0


def test_get_user_claimed_rewards(
    context,
    alice,
    mock_users_db,
    mock_user_budgets,
    mock_user_allocations,
    mock_patron_mode,
):
    mock_user_budgets.get_budget.return_value = USER1_BUDGET
    mock_user_allocations.get_user_allocation_sum.return_value = 100_000000000
    mock_user_allocations.has_user_allocated_rewards.return_value = True

    service = CalculatedUserRewards(
        user_budgets=mock_user_budgets,
        allocations=mock_user_allocations,
        patrons_mode=mock_patron_mode,
    )

    result = service.get_user_claimed_rewards(context, alice.address)

    assert result == USER1_BUDGET - 100_000000000


def test_get_user_claimed_rewards_returns_0_when_user_does_not_allocate(
    context,
    alice,
    mock_users_db,
    mock_user_budgets,
    mock_user_allocations,
    mock_patron_mode,
):
    mock_user_budgets.get_budget.return_value = USER1_BUDGET
    mock_user_allocations.get_user_allocation_sum.return_value = 100_000000000
    mock_user_allocations.has_user_allocated_rewards.return_value = False

    service = CalculatedUserRewards(
        user_budgets=mock_user_budgets,
        allocations=mock_user_allocations,
        patrons_mode=mock_patron_mode,
    )

    result = service.get_user_claimed_rewards(context, alice.address)

    assert result == 0

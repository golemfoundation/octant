import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories import FactoriesAggregator

"""Test cases for the GET /rewards/budget/{user_address}/epoch/{epoch_number} endpoint"""


@pytest.mark.asyncio
async def test_returns_none_when_no_budget(
    fast_client: AsyncClient, fast_session: AsyncSession, factories: FactoriesAggregator
):
    """Should return 204 No Content when user has no budget for the epoch"""
    # Given: a user with no budget
    alice = await factories.users.get_or_create_alice()

    async with fast_client as client:
        resp = await client.get(f"rewards/budget/{alice.address}/epoch/1")
        assert resp.status_code == status.HTTP_204_NO_CONTENT
        assert resp.text == ""


@pytest.mark.asyncio
async def test_returns_budget_when_it_exists(
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    """Should return user's budget when it exists for the epoch"""

    # Given: users with budgets for different epochs
    alice = await factories.users.get_or_create_alice()
    budget1 = await factories.budgets.create(user=alice, epoch=1)
    budget2 = await factories.budgets.create(user=alice, epoch=2)

    async with fast_client as client:
        # Budget for epoch 1
        resp = await client.get(f"rewards/budget/{alice.address}/epoch/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"budget": budget1.budget}

        # Budget for epoch 2
        resp = await client.get(f"rewards/budget/{alice.address}/epoch/2")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"budget": budget2.budget}

        # No budget for epoch 3
        resp = await client.get(f"rewards/budget/{alice.address}/epoch/3")
        assert resp.status_code == status.HTTP_204_NO_CONTENT
        assert resp.text == ""


@pytest.mark.asyncio
async def test_returns_zero_budget_when_amount_is_zero(
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    """Should return budget even when amount is zero"""

    # Given: a user with zero budget
    alice = await factories.users.get_or_create_alice()
    budget = await factories.budgets.create(user=alice, epoch=1, amount=0)

    async with fast_client as client:
        resp = await client.get(f"rewards/budget/{alice.address}/epoch/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"budget": "0"}

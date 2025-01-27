import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.v2.factories import FactoriesAggregator


@pytest.mark.asyncio
async def test_returns_empty_budgets_when_no_users(
    fast_client: AsyncClient,
    fast_session: AsyncSession,
):
    """Should return empty budgets list when no users have budgets for the epoch"""
    
    async with fast_client as client:
        resp = await client.get("/rewards/budgets/epoch/1")
        assert resp.status_code == 200
        assert resp.json() == {"budgets": []}


@pytest.mark.asyncio
async def test_returns_all_user_budgets_for_epoch(
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return budgets for all users in the given epoch"""
    
    # Given: multiple users with budgets in different epochs
    alice = await factories.users.get_or_create_alice()
    bob = await factories.users.get_or_create_bob()
    charlie = await factories.users.get_or_create_charlie()

    # Create budgets for different epochs
    alice_budget1 = await factories.budgets.create(user=alice, epoch=1, amount=100)
    bob_budget1 = await factories.budgets.create(user=bob, epoch=1, amount=200)
    charlie_budget1 = await factories.budgets.create(user=charlie, epoch=1, amount=300)
    
    # Create budgets for a different epoch
    await factories.budgets.create(user=alice, epoch=2, amount=400)
    await factories.budgets.create(user=bob, epoch=2, amount=500)

    async with fast_client as client:
        # When: requesting budgets for epoch 1
        resp = await client.get("/rewards/budgets/epoch/1")
        
        # Then: should return all budgets for epoch 1
        assert resp.status_code == 200
        budgets = resp.json()["budgets"]
        
        # Convert to set for order-independent comparison
        expected_budgets = [
            {"address": alice.address, "amount": str(alice_budget1.budget)},
            {"address": bob.address, "amount": str(bob_budget1.budget)},
            {"address": charlie.address, "amount": str(charlie_budget1.budget)},
        ]
        assert len(budgets) == 3
        assert {(b["address"], b["amount"]) for b in budgets} == {
            (b["address"], b["amount"]) for b in expected_budgets
        }


@pytest.mark.asyncio
async def test_returns_empty_budgets_for_future_epoch(
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return empty budgets list for an epoch with no budgets"""
    
    # Given: users with budgets in epoch 1
    alice = await factories.users.get_or_create_alice()
    bob = await factories.users.get_or_create_bob()
    
    await factories.budgets.create(user=alice, epoch=1, amount=100)
    await factories.budgets.create(user=bob, epoch=1, amount=200)

    async with fast_client as client:
        # When: requesting budgets for epoch 2 (which has no budgets)
        resp = await client.get("/rewards/budgets/epoch/2")
        
        # Then: should return empty list
        assert resp.status_code == 200
        assert resp.json() == {"budgets": []}


@pytest.mark.asyncio
async def test_includes_zero_budgets(
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should include users with zero budgets in the response"""
    
    # Given: users with zero and non-zero budgets
    alice = await factories.users.get_or_create_alice()
    bob = await factories.users.get_or_create_bob()
    
    alice_budget = await factories.budgets.create(user=alice, epoch=1, amount=100)
    bob_budget = await factories.budgets.create(user=bob, epoch=1, amount=0)

    async with fast_client as client:
        resp = await client.get("/rewards/budgets/epoch/1")
        
        assert resp.status_code == 200
        budgets = resp.json()["budgets"]
        
        expected_budgets = [
            {"address": alice.address, "amount": str(alice_budget.budget)},
            {"address": bob.address, "amount": "0"},
        ]
        assert len(budgets) == 2
        assert {(b["address"], b["amount"]) for b in budgets} == {
            (b["address"], b["amount"]) for b in expected_budgets
        }
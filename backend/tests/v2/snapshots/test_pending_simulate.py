from http import HTTPStatus
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.engine.user.effective_deposit import DepositEvent, EventType
from tests.v2.factories import FactoriesAggregator
from v2.core.dependencies import get_current_timestamp
from v2.epochs.dependencies import get_current_epoch, get_epochs_subgraph
from v2.deposits.dependencies import get_deposit_events_repository
from v2.staking_proceeds.dependencies import get_staking_proceeds


@pytest.mark.asyncio
async def test_simulate_pending_snapshot_success_empty_deposits(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    monkeypatch,
):
    """Should successfully simulate a pending snapshot"""
    # Mock dependencies
    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.fetch_epoch_by_number = AsyncMock(
        return_value=MagicMock(fromTs=1000, duration=1000)
    )

    mock_deposit_events_repository = MagicMock()
    mock_deposit_events_repository.get_all_users_events = AsyncMock(return_value={})

    mock_staking_proceeds = MagicMock()
    mock_staking_proceeds.get = AsyncMock(return_value=1000000)

    # Override dependencies
    fast_app.dependency_overrides[get_current_epoch] = lambda: 1
    fast_app.dependency_overrides[get_current_timestamp] = lambda: 900
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: mock_deposit_events_repository
    fast_app.dependency_overrides[get_staking_proceeds] = lambda: mock_staking_proceeds

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/pending/simulate")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Verify response structure
        assert "rewards" in result
        assert result["rewards"]["stakingProceeds"] == str(1_000_000)
        assert result["rewards"]["lockedRatio"] == str(0)
        assert result["rewards"]["totalEffectiveDeposit"] == str(0)
        assert result["rewards"]["totalRewards"] == str(700_000)
        assert result["rewards"]["vanillaIndividualRewards"] == str(0)
        assert result["rewards"]["operationalCost"] == str(250_000)
        assert result["rewards"]["communityFund"] == str(50_000)
        assert result["rewards"]["ppf"] == str(350_000)

        assert "userDeposits" in result
        assert len(result["userDeposits"]) == 0

        assert "userBudgets" in result
        assert len(result["userBudgets"]) == 0


@pytest.mark.asyncio
async def test_simulate_pending_snapshot_with_deposits(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should successfully simulate a pending snapshot with user deposits"""
    # Mock dependencies
    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.fetch_epoch_by_number = AsyncMock(
        return_value=MagicMock(fromTs=1000, duration=1000)
    )

    # Mock deposit events

    alice = await factories.users.create()
    bob = await factories.users.create()

    mock_deposit_events_repository = MagicMock()
    mock_deposit_events_repository.get_all_users_events = AsyncMock(
        return_value={
            alice.address: [
                DepositEvent(
                    user=alice,
                    type=EventType.LOCK,
                    timestamp=400,  # made in the previous epoch
                    amount=0,
                    deposit_before=100 * 10**18,
                )
            ],
            bob.address: [
                DepositEvent(
                    user=bob,
                    type=EventType.LOCK,
                    timestamp=500,
                    amount=0,
                    deposit_before=200 * 10**18,
                )
            ],
        }
    )

    mock_staking_proceeds = MagicMock()
    mock_staking_proceeds.get = AsyncMock(return_value=1000000)

    # Override dependencies
    fast_app.dependency_overrides[get_current_epoch] = lambda: 2
    fast_app.dependency_overrides[get_current_timestamp] = lambda: 1800
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: mock_deposit_events_repository
    fast_app.dependency_overrides[get_staking_proceeds] = lambda: mock_staking_proceeds

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/pending/simulate")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Verify response structure and content
        assert "rewards" in result
        assert "userDeposits" in result
        assert "userBudgets" in result
        assert len(result["userDeposits"]) == 2

        alice_deposit = result["userDeposits"][0]
        bob_deposit = result["userDeposits"][1]

        assert alice_deposit["userAddress"] == alice.address
        assert alice_deposit["effectiveDeposit"] == str(100 * 10**18)
        assert alice_deposit["deposit"] == str(100 * 10**18)

        assert bob_deposit["userAddress"] == bob.address
        assert bob_deposit["effectiveDeposit"] == str(200 * 10**18)
        assert bob_deposit["deposit"] == str(200 * 10**18)

        assert len(result["userBudgets"]) == 2
        alice_budget = result["userBudgets"][0]
        bob_budget = result["userBudgets"][1]

        assert alice_budget["userAddress"] == alice.address
        assert (
            int(alice_budget["budget"]) > 0
        )  # Not zero - for our calc it's actually 58333

        assert bob_budget["userAddress"] == bob.address
        assert (
            int(bob_budget["budget"]) > 0
        )  # Not zero - for our calc it's actually 116666

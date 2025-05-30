from http import HTTPStatus
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.engine.user.effective_deposit import DepositEvent, EventType
from tests.v2.factories import FactoriesAggregator
from v2.epochs.dependencies import get_epochs_subgraph, get_epochs_contracts
from v2.deposits.dependencies import get_deposit_events_repository
from v2.staking_proceeds.dependencies import get_staking_proceeds


@pytest.mark.asyncio
async def test_create_pending_snapshot_success(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
):
    """Should successfully create a pending snapshot"""
    # Mock dependencies
    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_pending_epoch = AsyncMock(return_value=1)

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.fetch_epoch_by_number = AsyncMock(
        return_value=MagicMock(fromTs=1000, duration=1000)
    )

    mock_deposit_events_repository = MagicMock()
    mock_deposit_events_repository.get_all_users_events = AsyncMock(return_value={})

    mock_staking_proceeds = MagicMock()
    mock_staking_proceeds.get = AsyncMock(return_value=1000000)

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: mock_deposit_events_repository
    fast_app.dependency_overrides[get_staking_proceeds] = lambda: mock_staking_proceeds

    # Test endpoint
    async with fast_client as client:
        resp = await client.post("snapshots/pending")
        assert resp.status_code == HTTPStatus.CREATED
        result = resp.json()

        # Verify response
        assert "epoch" in result
        assert result["epoch"] == 1


@pytest.mark.asyncio
async def test_create_pending_snapshot_ok_but_outside_of_allocation_window(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
):
    """Should return 200 empty because outside of allocation window"""
    # Mock dependencies
    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_pending_epoch = AsyncMock(return_value=None)

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.fetch_epoch_by_number = AsyncMock(
        return_value=MagicMock(fromTs=1000, duration=1000)
    )

    mock_deposit_events_repository = MagicMock()
    mock_deposit_events_repository.get_all_users_events = AsyncMock(return_value={})

    mock_staking_proceeds = MagicMock()
    mock_staking_proceeds.get = AsyncMock(return_value=1000000)

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: mock_deposit_events_repository
    fast_app.dependency_overrides[get_staking_proceeds] = lambda: mock_staking_proceeds

    # Test endpoint
    async with fast_client as client:
        resp = await client.post("snapshots/pending")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() is None


@pytest.mark.asyncio
async def test_create_pending_snapshot_in_aw_but_already_exists(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return 200 empty when there is no pending epoch"""
    # Mock dependencies
    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_pending_epoch = AsyncMock(return_value=1)

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.fetch_epoch_by_number = AsyncMock(
        return_value=MagicMock(fromTs=1000, duration=1000)
    )

    mock_deposit_events_repository = MagicMock()
    mock_deposit_events_repository.get_all_users_events = AsyncMock(return_value={})

    mock_staking_proceeds = MagicMock()
    mock_staking_proceeds.get = AsyncMock(return_value=1000000)

    await factories.pending_snapshots.create(epoch=1)

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: mock_deposit_events_repository
    fast_app.dependency_overrides[get_staking_proceeds] = lambda: mock_staking_proceeds

    # Test endpoint
    async with fast_client as client:
        resp = await client.post("snapshots/pending")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() is None


@pytest.mark.asyncio
async def test_create_pending_snapshot_ok_and_saved(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return None when snapshot already exists"""
    # Mock dependencies
    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_pending_epoch = AsyncMock(return_value=1)

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.fetch_epoch_by_number = AsyncMock(
        return_value=MagicMock(fromTs=1000, duration=1000)
    )

    mock_deposit_events_repository = MagicMock()
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
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: mock_deposit_events_repository
    fast_app.dependency_overrides[get_staking_proceeds] = lambda: mock_staking_proceeds

    # Test endpoint
    async with fast_client as client:
        resp = await client.post("snapshots/pending")
        assert resp.status_code == HTTPStatus.CREATED
        result = resp.json()

        # Verify response
        assert "epoch" in result
        assert result["epoch"] == 1

        # Verify that the snapshot was saved
        pending_snapshot = await factories.pending_snapshots.get(1)
        assert pending_snapshot is not None
        assert pending_snapshot.epoch == 1
        assert pending_snapshot.eth_proceeds == "1000000"

        # Verify that the user deposits were saved
        deposits = await factories.deposits.get_for_epoch(1)
        assert len(deposits) == 2
        assert deposits[0].user == alice
        assert deposits[0].effective_deposit == (str(100 * 10**18))
        assert deposits[1].user == bob
        assert deposits[1].effective_deposit == (str(200 * 10**18))

        # Verify that the budgets were saved
        budgets = await factories.budgets.get_for_epoch(1)
        assert len(budgets) == 2
        assert budgets[0].user == alice
        assert int(budgets[0].budget) > 0
        assert budgets[1].user == bob
        assert int(budgets[1].budget) > 0

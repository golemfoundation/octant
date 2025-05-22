from http import HTTPStatus
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.context.epoch.details import EpochDetails
from tests.v2.factories import FactoriesAggregator
from v2.epochs.dependencies import get_epochs_subgraph, get_epochs_contracts
from v2.projects.dependencies import get_projects_contracts


@pytest.mark.asyncio
async def test_create_finalized_snapshot_success(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should successfully simulate a finalized snapshot"""
    # Mock dependencies

    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_finalized_epoch = AsyncMock(return_value=1)

    project_addresses = [
        "0x1234567890123456789012345678901234567890",
        "0x1234567890123456789012345678901234567891",
        "0x1234567890123456789012345678901234567892",
        "0x1234567890123456789012345678901234567893",
        "0x1234567890123456789012345678901234567894",
        "0x1234567890123456789012345678901234567895",
    ]

    mock_projects_contracts = MagicMock()
    mock_projects_contracts.get_project_addresses = AsyncMock(
        return_value=project_addresses
    )

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=1,
            start=1000,
            duration=1000,
            decision_window=1000,
            remaining_sec=0,
        )
    )

    # We dont have to mock rewards settings :)

    # Mock pending snapshot
    await factories.pending_snapshots.create(
        epoch=1,
        eth_proceeds=1000000,
        total_effective_deposit=1000000,
        locked_ratio=0.5,
        total_rewards=1000000,
        vanilla_individual_rewards=1000000,
        operational_cost=100000,
        ppf=25000,
        community_fund=50000,
    )

    # Mock allocations
    alice = await factories.users.create()
    bob = await factories.users.create()

    await factories.uniqueness_quotients.create(
        user=alice,
        epoch=1,
        score=22.0,
    )

    await factories.uniqueness_quotients.create(
        user=bob,
        epoch=1,
        score=22.0,
    )

    await factories.budgets.create(
        user=alice,
        epoch=1,
        amount=1_000_000,
    )
    await factories.budgets.create(
        user=bob,
        epoch=1,
        amount=1_000_000,
    )

    await factories.allocations.create(
        user=alice,
        epoch=1,
        nonce=1,
        amount=500_000,
        project_address=project_addresses[0],
    )

    await factories.allocations.create(
        user=bob,
        epoch=1,
        nonce=2,
        amount=500_000,
        project_address=project_addresses[1],
    )

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts
    fast_app.dependency_overrides[
        get_projects_contracts
    ] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph

    # Test endpoint
    async with fast_client as client:
        resp = await client.post("snapshots/finalized")
        assert resp.status_code == HTTPStatus.CREATED
        result = resp.json()
        assert result["epoch"] == 1

        # Verify that the snapshot was saved
        finalized_snapshot = await factories.finalized_snapshots.get(1)
        assert finalized_snapshot is not None
        assert finalized_snapshot.epoch == 1
        assert int(finalized_snapshot.patrons_rewards) == 0
        assert int(finalized_snapshot.matched_rewards) == 200_000
        assert int(finalized_snapshot.leftover) != 0
        assert (
            int(finalized_snapshot.total_withdrawals) == 2_080_000
        ), "It's 2M (allocations taken self + for project) + 80k (matching rewards)"
        assert finalized_snapshot.withdrawals_merkle_root is not None

        # Verify that the rewards were saved
        rewards = await factories.rewards.get_for_epoch(1)
        assert (
            len(rewards) == 4
        ), "We should have 4 rewards: 2 for projects and 2 for users"


@pytest.mark.asyncio
async def test_create_finalized_snapshot_not_finalized(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should fail (silently) if the epoch is not finalized"""
    # Mock dependencies

    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_finalized_epoch = AsyncMock(return_value=None)

    project_addresses = [
        "0x1234567890123456789012345678901234567890",
        "0x1234567890123456789012345678901234567891",
        "0x1234567890123456789012345678901234567892",
        "0x1234567890123456789012345678901234567893",
        "0x1234567890123456789012345678901234567894",
        "0x1234567890123456789012345678901234567895",
    ]

    mock_projects_contracts = MagicMock()
    mock_projects_contracts.get_project_addresses = AsyncMock(
        return_value=project_addresses
    )

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=1,
            start=1000,
            duration=1000,
            decision_window=1000,
            remaining_sec=0,
        )
    )

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts
    fast_app.dependency_overrides[
        get_projects_contracts
    ] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph

    # Test endpoint
    async with fast_client as client:
        resp = await client.post("snapshots/finalized")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()
        assert result is None

        # Verify that the snapshot was saved
        finalized_snapshot = await factories.finalized_snapshots.get(1)
        assert finalized_snapshot is None

        rewards = await factories.rewards.get_for_epoch(1)
        assert (
            len(rewards) == 0
        ), "We should have 0 rewards as the epoch is not finalized"


@pytest.mark.asyncio
async def test_create_finalized_snapshot_finalized_but_no_pending_snapshot(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should fail (silently) if the epoch is finalized but there is no pending snapshot"""
    # Mock dependencies

    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_finalized_epoch = AsyncMock(return_value=None)

    project_addresses = [
        "0x1234567890123456789012345678901234567890",
        "0x1234567890123456789012345678901234567891",
        "0x1234567890123456789012345678901234567892",
        "0x1234567890123456789012345678901234567893",
        "0x1234567890123456789012345678901234567894",
        "0x1234567890123456789012345678901234567895",
    ]

    mock_projects_contracts = MagicMock()
    mock_projects_contracts.get_project_addresses = AsyncMock(
        return_value=project_addresses
    )

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=1,
            start=1000,
            duration=1000,
            decision_window=1000,
            remaining_sec=0,
        )
    )

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts
    fast_app.dependency_overrides[
        get_projects_contracts
    ] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph

    # Test endpoint
    async with fast_client as client:
        resp = await client.post("snapshots/finalized")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()
        assert result is None

        # Verify that the snapshot was saved
        finalized_snapshot = await factories.finalized_snapshots.get(1)
        assert finalized_snapshot is None

        rewards = await factories.rewards.get_for_epoch(1)
        assert (
            len(rewards) == 0
        ), "We should have 0 rewards as the epoch is not finalized"


@pytest.mark.asyncio
async def test_create_finalized_snapshot_finalized_and_already_created(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should fail (silently) if the epoch is finalized and there is already a finalized snapshot"""
    # Mock dependencies

    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_finalized_epoch = AsyncMock(return_value=None)

    project_addresses = [
        "0x1234567890123456789012345678901234567890",
        "0x1234567890123456789012345678901234567891",
        "0x1234567890123456789012345678901234567892",
        "0x1234567890123456789012345678901234567893",
        "0x1234567890123456789012345678901234567894",
        "0x1234567890123456789012345678901234567895",
    ]

    mock_projects_contracts = MagicMock()
    mock_projects_contracts.get_project_addresses = AsyncMock(
        return_value=project_addresses
    )

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=1,
            start=1000,
            duration=1000,
            decision_window=1000,
            remaining_sec=0,
        )
    )

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts
    fast_app.dependency_overrides[
        get_projects_contracts
    ] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph

    # Mock pending snapshot
    await factories.pending_snapshots.create(epoch=1)

    # Mock finalized snapshot
    await factories.finalized_snapshots.create(epoch=1)

    # Test endpoint
    async with fast_client as client:
        resp = await client.post("snapshots/finalized")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()
        assert result is None

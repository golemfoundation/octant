from http import HTTPStatus
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.context.epoch.details import EpochDetails
from tests.v2.factories import FactoriesAggregator
from v2.epochs.dependencies import (
    get_epochs_subgraph,
    get_pending_epoch,
)
from v2.projects.dependencies import get_projects_contracts


@pytest.mark.asyncio
async def test_simulate_finalized_snapshot_success(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should successfully simulate a finalized snapshot"""
    # Mock dependencies

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

    mock_pending_epoch_number = 1

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
        amount=1_000_000,
        project_address=project_addresses[0],
    )

    await factories.allocations.create(
        user=bob,
        epoch=1,
        nonce=2,
        amount=1_000_000,
        project_address=project_addresses[1],
    )

    # Override dependencies
    fast_app.dependency_overrides[
        get_projects_contracts
    ] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_pending_epoch] = lambda: mock_pending_epoch_number

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/finalized/simulate")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Verify response structure
        assert (
            int(result["patronsRewards"]) == 0
        ), "We did not have any patrons this epoch"
        assert int(result["matchedRewards"]) > 0, "We had matched rewards this epoch"
        assert (
            len(result["projectsRewards"]) == 2
        ), "We made allocations for 2 different projects"
        assert (
            len(result["userRewards"]) == 0
        ), "We allocated all the funds to projects, so no individual rewards"
        assert int(result["totalWithdrawals"]) > 0
        assert int(result["leftover"]) == -1_122_500
        assert (
            result["merkleRoot"] is not None
        ), "There were allocations (project or user), so we should have a merkle root"


@pytest.mark.asyncio
async def test_simulate_finalized_snapshot_not_in_open_allocation_window(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Making finalized snapshots is possible only in the open allocation window"""
    # Mock dependencies

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

    mock_pending_epoch_number = None  # We are not in the open allocation window

    # Override dependencies
    fast_app.dependency_overrides[
        get_projects_contracts
    ] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_pending_epoch] = lambda: mock_pending_epoch_number

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/finalized/simulate")
        assert (
            resp.status_code == HTTPStatus.BAD_REQUEST
        ), "We are not in the open allocation window, so we should not be able to simulate"


@pytest.mark.asyncio
async def test_simulate_finalized_snapshot_missing_pending_snapshot(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Missing pending snapshot is not allowed, this is quite critical"""
    # Mock dependencies

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

    mock_pending_epoch_number = 1

    # We do not create pending snapshot, to simulate this case

    # Override dependencies
    fast_app.dependency_overrides[
        get_projects_contracts
    ] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_pending_epoch] = lambda: mock_pending_epoch_number

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/finalized/simulate")
        assert (
            resp.status_code == HTTPStatus.BAD_REQUEST
        ), "We are not in the open allocation window, so we should not be able to simulate"


@pytest.mark.asyncio
async def test_simulate_finalized_snapshot_no_allocations(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should successfully simulate a finalized snapshot"""
    # Mock dependencies

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

    mock_pending_epoch_number = 1

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

    # We have users, but no allocations (no actions performed in this epoch)
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

    # Override dependencies
    fast_app.dependency_overrides[
        get_projects_contracts
    ] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_pending_epoch] = lambda: mock_pending_epoch_number

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/finalized/simulate")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Verify response structure
        assert (
            int(result["patronsRewards"]) == 0
        ), "We did not have any patrons this epoch"
        assert (
            int(result["matchedRewards"]) > 0
        ), "We should always have matched rewards"
        assert (
            len(result["projectsRewards"]) == 0
        ), "We made no allocations, so no projects rewards"
        assert (
            len(result["userRewards"]) == 0
        ), "We made no allocations, so no individual rewards"
        assert (
            int(result["totalWithdrawals"]) == 0
        ), "We made no withdrawals or allocations, so zero"
        assert (
            int(result["leftover"]) > 0
        ), "Leftover should be non zero, as we have matched rewards"
        assert (
            result["merkleRoot"] is None
        ), "There were no allocations, so no merkle root"


@pytest.mark.asyncio
async def test_simulate_finalized_snapshot_users_take_all_rewards(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Users take all the rewards, so no projects rewards"""
    # Mock dependencies

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

    mock_pending_epoch_number = 1

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
        amount=0,  # Making zeroth allocation means that user took all the rewards
        project_address=project_addresses[0],
    )

    await factories.allocations.create(
        user=bob,
        epoch=1,
        nonce=2,
        amount=0,  # Making zeroth allocation means that user took all the rewards
        project_address=project_addresses[1],
    )

    # Override dependencies
    fast_app.dependency_overrides[
        get_projects_contracts
    ] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_pending_epoch] = lambda: mock_pending_epoch_number

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/finalized/simulate")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Verify response structure
        assert (
            int(result["patronsRewards"]) == 0
        ), "We did not have any patrons this epoch"
        assert int(result["matchedRewards"]) > 0, "We had matched rewards this epoch"
        assert (
            len(result["projectsRewards"]) == 0
        ), "We made no allocations, so no projects rewards"
        assert (
            len(result["userRewards"]) == 2
        ), "We allocated all the funds to projects, so no individual rewards"
        assert int(result["totalWithdrawals"]) > 0
        assert (
            int(result["leftover"]) != 0
        ), "Leftover should be non zero, as we have matched rewards"
        assert (
            result["merkleRoot"] is not None
        ), "There were allocations (project or user), so we should have a merkle root"

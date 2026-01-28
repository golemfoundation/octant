"""
Tests for backward compatibility with epochs 1-10.

Ensures that E11 changes don't break existing epoch logic.
"""

from datetime import datetime, timezone
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


@pytest.mark.parametrize("epoch_number", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
@pytest.mark.asyncio
async def test_standard_epochs_work_unchanged(
    epoch_number: int,
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    Test that all standard epochs (1-10) continue to work as before E11 changes.

    Verifies:
    - staking_matched_reserved_for_v2 is always 0
    - matched_rewards includes both staking + patron portions
    - QF distribution works normally
    """
    project_addresses = [
        "0x1234567890123456789012345678901234567890",
        "0x1234567890123456789012345678901234567891",
    ]

    mock_projects_contracts = MagicMock()
    mock_projects_contracts.get_project_addresses = AsyncMock(
        return_value=project_addresses
    )

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=epoch_number,
            start=1000,
            duration=1000,
            decision_window=1000,
            remaining_sec=0,
        )
    )

    # Create pending snapshot
    await factories.pending_snapshots.create(
        epoch=epoch_number,
        eth_proceeds=1_000_000,
        total_effective_deposit=500_000,
        locked_ratio=0.5,  # Between IRE (0.35) and TR (0.7)
        total_rewards=800_000,
        vanilla_individual_rewards=400_000,
        operational_cost=100_000,
        ppf=50_000,
        community_fund=25_000,
    )

    # Create patron and normal users
    patron = await factories.users.create()
    normal_user = await factories.users.create()

    patron_created_at = datetime.fromtimestamp(1000, tz=timezone.utc)
    await factories.patrons.create(
        user=patron, patron_mode_enabled=True, created_at=patron_created_at
    )

    await factories.uniqueness_quotients.create(
        user=patron, epoch=epoch_number, score=20.0
    )
    await factories.uniqueness_quotients.create(
        user=normal_user, epoch=epoch_number, score=20.0
    )

    await factories.budgets.create(user=patron, epoch=epoch_number, amount=100_000)
    await factories.budgets.create(user=normal_user, epoch=epoch_number, amount=75_000)

    await factories.allocations.create(
        user=normal_user,
        epoch=epoch_number,
        nonce=1,
        amount=50_000,
        project_address=project_addresses[0],
    )

    # Override dependencies
    fast_app.dependency_overrides[
        get_projects_contracts
    ] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_pending_epoch] = lambda: epoch_number

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/finalized/simulate")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Standard epochs should NOT reserve staking
        staking_reserved = int(result["stakingMatchedReservedForV2"])
        assert (
            staking_reserved == 0
        ), f"Epoch {epoch_number} should not reserve staking (got {staking_reserved})"

        # Verify patron rewards
        patron_rewards = int(result["patronsRewards"])
        assert patron_rewards == 100_000, "Patron rewards should be calculated"

        # Verify matched rewards includes both staking + patron portions
        matched_rewards = int(result["matchedRewards"])
        # Expected: (0.7 - 0.5) * 1_000_000 + 100_000 = 200_000 + 100_000 = 300_000
        expected_matched = 300_000
        assert (
            matched_rewards == expected_matched
        ), f"Epoch {epoch_number}: matched_rewards should include staking + patron"

        # Verify basic response structure
        assert "projectsRewards" in result
        assert "userRewards" in result
        assert "totalWithdrawals" in result
        assert "leftover" in result
        assert "merkleRoot" in result


@pytest.mark.asyncio
async def test_epochs_without_patrons_still_get_staking_matched_rewards(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    Test that epochs 1-10 without patron users still get staking matched rewards.

    Before E11, matched rewards came from staking proceeds even without patrons.
    This should continue to work.
    """
    epoch_number = 8
    project_addresses = ["0x1234567890123456789012345678901234567890"]

    mock_projects_contracts = MagicMock()
    mock_projects_contracts.get_project_addresses = AsyncMock(
        return_value=project_addresses
    )

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=epoch_number,
            start=1000,
            duration=1000,
            decision_window=1000,
            remaining_sec=0,
        )
    )

    # Create pending snapshot
    await factories.pending_snapshots.create(
        epoch=epoch_number,
        eth_proceeds=1_000_000,
        total_effective_deposit=300_000,
        locked_ratio=0.3,  # Below IRE (0.35)
        total_rewards=800_000,
        vanilla_individual_rewards=400_000,
        operational_cost=100_000,
        ppf=50_000,
        community_fund=25_000,
    )

    # Create only normal users (NO patrons)
    user = await factories.users.create()
    await factories.uniqueness_quotients.create(
        user=user, epoch=epoch_number, score=20.0
    )
    await factories.budgets.create(user=user, epoch=epoch_number, amount=100_000)

    await factories.allocations.create(
        user=user,
        epoch=epoch_number,
        nonce=1,
        amount=80_000,
        project_address=project_addresses[0],
    )

    fast_app.dependency_overrides[
        get_projects_contracts
    ] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_pending_epoch] = lambda: epoch_number

    async with fast_client as client:
        resp = await client.get("snapshots/finalized/simulate")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # No patrons
        patron_rewards = int(result["patronsRewards"])
        assert patron_rewards == 0

        # But still has matched rewards from staking (locked_ratio < IRE)
        # Expected: 0.35 * 1_000_000 = 350_000
        matched_rewards = int(result["matchedRewards"])
        assert (
            matched_rewards == 350_000
        ), "Standard epochs get staking matched rewards even without patrons"

        # No staking reservation
        staking_reserved = int(result["stakingMatchedReservedForV2"])
        assert staking_reserved == 0


@pytest.mark.asyncio
async def test_transition_from_epoch_10_to_11(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    Test the transition from E10 (standard) to E11 (with reservation).

    Verifies that identical inputs produce different outputs based on epoch number.
    """
    project_addresses = ["0x1234567890123456789012345678901234567890"]

    mock_projects_contracts = MagicMock()
    mock_projects_contracts.get_project_addresses = AsyncMock(
        return_value=project_addresses
    )

    # Test E10 first
    mock_epochs_subgraph_e10 = MagicMock()
    mock_epochs_subgraph_e10.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=10,
            start=1000,
            duration=1000,
            decision_window=1000,
            remaining_sec=0,
        )
    )

    await factories.pending_snapshots.create(
        epoch=10,
        eth_proceeds=1_000_000,
        total_effective_deposit=500_000,
        locked_ratio=0.5,
        total_rewards=800_000,
        vanilla_individual_rewards=400_000,
        operational_cost=100_000,
        ppf=50_000,
        community_fund=25_000,
    )

    patron_e10 = await factories.users.create()
    patron_created_at = datetime.fromtimestamp(1000, tz=timezone.utc)
    await factories.patrons.create(
        user=patron_e10, patron_mode_enabled=True, created_at=patron_created_at
    )
    await factories.uniqueness_quotients.create(user=patron_e10, epoch=10, score=20.0)
    await factories.budgets.create(user=patron_e10, epoch=10, amount=150_000)

    fast_app.dependency_overrides[
        get_projects_contracts
    ] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[
        get_epochs_subgraph
    ] = lambda: mock_epochs_subgraph_e10
    fast_app.dependency_overrides[get_pending_epoch] = lambda: 10

    resp_e10 = await fast_client.get("snapshots/finalized/simulate")
    result_e10 = resp_e10.json()

    e10_staking_reserved = int(result_e10["stakingMatchedReservedForV2"])
    e10_matched_rewards = int(result_e10["matchedRewards"])

    # Now test E11 with IDENTICAL parameters
    mock_epochs_subgraph_e11 = MagicMock()
    mock_epochs_subgraph_e11.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=11,
            start=1000,
            duration=1000,
            decision_window=1000,
            remaining_sec=0,
        )
    )

    await factories.pending_snapshots.create(
        epoch=11,
        eth_proceeds=1_000_000,  # Same as E10
        total_effective_deposit=500_000,  # Same as E10
        locked_ratio=0.5,  # Same as E10
        total_rewards=800_000,
        vanilla_individual_rewards=400_000,
        operational_cost=100_000,
        ppf=50_000,
        community_fund=25_000,
    )

    patron_e11 = await factories.users.create()
    patron_created_at = datetime.fromtimestamp(1000, tz=timezone.utc)
    await factories.patrons.create(
        user=patron_e11, patron_mode_enabled=True, created_at=patron_created_at
    )
    await factories.uniqueness_quotients.create(user=patron_e11, epoch=11, score=20.0)
    await factories.budgets.create(
        user=patron_e11, epoch=11, amount=150_000
    )  # Same as E10

    fast_app.dependency_overrides[
        get_epochs_subgraph
    ] = lambda: mock_epochs_subgraph_e11
    fast_app.dependency_overrides[get_pending_epoch] = lambda: 11

    resp_e11 = await fast_client.get("snapshots/finalized/simulate")
    result_e11 = resp_e11.json()

    e11_staking_reserved = int(result_e11["stakingMatchedReservedForV2"])
    e11_matched_rewards = int(result_e11["matchedRewards"])

    # Verify the differences
    assert e10_staking_reserved == 0, "E10 should not reserve staking"
    assert e11_staking_reserved == 200_000, "E11 should reserve staking portion"

    # E10: matched = (0.7 - 0.5) * 1M + 150k = 200k + 150k = 350k
    assert e10_matched_rewards == 350_000

    # E11: matched = patron rewards only = 150k
    assert e11_matched_rewards == 150_000

    # The staking portion (200k) is reserved in E11, not distributed
    assert e10_matched_rewards == e11_matched_rewards + e11_staking_reserved

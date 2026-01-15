"""
Tests for E11 finalized snapshot simulation with staking reservation for v2.

E11 is a transitional epoch where the matching fund is split:
- Staking portion → Reserved for v2 (stored but not distributed)
- Patron rewards → Distributed via QF as usual
"""

from http import HTTPStatus
from unittest.mock import AsyncMock, MagicMock, patch

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
async def test_e11_simulate_finalized_snapshot_with_staking_reservation(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    E11: Should reserve staking matched portion and use only patron rewards for QF.
    """
    # Mock dependencies
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
            epoch_num=11,  # E11
            start=1000,
            duration=1000,
            decision_window=1000,
            remaining_sec=0,
        )
    )

    mock_pending_epoch_number = 11

    # Create E11 pending snapshot with locked_ratio = 0.5
    # This is between IRE (0.35) and TR (0.7)
    # Staking portion should be: (0.7 - 0.5) * 1_000_000 = 0.2 * 1_000_000 = 200_000
    await factories.pending_snapshots.create(
        epoch=11,
        eth_proceeds=1_000_000,  # 1M wei staking proceeds
        total_effective_deposit=500_000,
        locked_ratio=0.5,  # Between IRE and TR
        total_rewards=800_000,
        vanilla_individual_rewards=400_000,
        operational_cost=100_000,
        ppf=50_000,
        community_fund=25_000,
    )

    # Create patron mode users
    alice_patron = await factories.users.create()
    bob_patron = await factories.users.create()
    charlie_normal = await factories.users.create()

    # Enable patron mode for alice and bob
    await factories.patron_mode_events.create(
        user_address=alice_patron.address, patron_mode_enabled=True
    )
    await factories.patron_mode_events.create(
        user_address=bob_patron.address, patron_mode_enabled=True
    )

    # Create UQ scores
    await factories.uniqueness_quotients.create(user=alice_patron, epoch=11, score=20.0)
    await factories.uniqueness_quotients.create(user=bob_patron, epoch=11, score=20.0)
    await factories.uniqueness_quotients.create(user=charlie_normal, epoch=11, score=20.0)

    # Create budgets
    # Patrons get budgets but donate everything automatically
    await factories.budgets.create(user=alice_patron, epoch=11, amount=100_000)
    await factories.budgets.create(user=bob_patron, epoch=11, amount=50_000)
    await factories.budgets.create(user=charlie_normal, epoch=11, amount=75_000)

    # Create allocation for normal user only
    await factories.allocations.create(
        user=charlie_normal,
        epoch=11,
        nonce=1,
        amount=50_000,  # Donates 50k, keeps 25k
        project_address=project_addresses[0],
    )

    # Override dependencies
    fast_app.dependency_overrides[get_projects_contracts] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_pending_epoch] = lambda: mock_pending_epoch_number

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/finalized/simulate")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Verify E11 specific behavior
        patron_rewards = int(result["patronsRewards"])
        matched_rewards = int(result["matchedRewards"])
        staking_reserved = int(result["stakingMatchedReservedForV2"])

        # Patron rewards = alice_budget + bob_budget = 100k + 50k = 150k
        assert patron_rewards == 150_000, "Patron rewards should be sum of patron budgets"

        # For E11: matched_rewards should equal patron_rewards (only patron rewards used for QF)
        assert (
            matched_rewards == patron_rewards
        ), "E11: matched_rewards should equal patronsRewards (no staking in QF)"

        # Staking portion: (0.7 - 0.5) * 1_000_000 = 200_000
        assert staking_reserved == 200_000, "Staking portion should be reserved"

        # Leftover should include the reserved staking portion
        leftover = int(result["leftover"])
        assert leftover > 0, "Leftover should include reserved staking"

        # Verify projects received QF matching from patron rewards only
        assert len(result["projectsRewards"]) > 0, "Projects should receive rewards"

        # Verify merkle root exists
        assert result["merkleRoot"] is not None, "Merkle root should exist"


@pytest.mark.asyncio
async def test_e11_staking_portion_calculation_locked_ratio_below_ire(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    E11 with locked_ratio < IRE (0.35): Should use full matched rewards percentage.
    Staking portion = 0.35 * staking_proceeds
    """
    project_addresses = ["0x1234567890123456789012345678901234567890"]

    mock_projects_contracts = MagicMock()
    mock_projects_contracts.get_project_addresses = AsyncMock(return_value=project_addresses)

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=11, start=1000, duration=1000, decision_window=1000, remaining_sec=0
        )
    )

    # Create E11 pending snapshot with locked_ratio = 0.2 (below IRE 0.35)
    await factories.pending_snapshots.create(
        epoch=11,
        eth_proceeds=1_000_000,
        total_effective_deposit=200_000,
        locked_ratio=0.2,  # Below IRE
        total_rewards=800_000,
        vanilla_individual_rewards=400_000,
        operational_cost=100_000,
        ppf=50_000,
        community_fund=25_000,
    )

    # Create a patron user
    patron = await factories.users.create()
    await factories.patron_mode_events.create(
        user_address=patron.address, patron_mode_enabled=True
    )
    await factories.uniqueness_quotients.create(user=patron, epoch=11, score=20.0)
    await factories.budgets.create(user=patron, epoch=11, amount=80_000)

    fast_app.dependency_overrides[get_projects_contracts] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_pending_epoch] = lambda: 11

    async with fast_client as client:
        resp = await client.get("snapshots/finalized/simulate")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Staking portion: 0.35 * 1_000_000 = 350_000
        staking_reserved = int(result["stakingMatchedReservedForV2"])
        assert staking_reserved == 350_000, "Should use full matched rewards percentage"

        # Matched rewards for distribution = patron rewards only
        matched_rewards = int(result["matchedRewards"])
        patron_rewards = int(result["patronsRewards"])
        assert matched_rewards == patron_rewards == 80_000


@pytest.mark.asyncio
async def test_e11_staking_portion_calculation_locked_ratio_at_tr(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    E11 with locked_ratio >= TR (0.7): No staking contribution.
    Staking portion = 0
    """
    project_addresses = ["0x1234567890123456789012345678901234567890"]

    mock_projects_contracts = MagicMock()
    mock_projects_contracts.get_project_addresses = AsyncMock(return_value=project_addresses)

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=11, start=1000, duration=1000, decision_window=1000, remaining_sec=0
        )
    )

    # Create E11 pending snapshot with locked_ratio = 0.75 (above TR 0.7)
    await factories.pending_snapshots.create(
        epoch=11,
        eth_proceeds=1_000_000,
        total_effective_deposit=750_000,
        locked_ratio=0.75,  # Above TR
        total_rewards=800_000,
        vanilla_individual_rewards=400_000,
        operational_cost=100_000,
        ppf=50_000,
        community_fund=25_000,
    )

    # Create a patron user
    patron = await factories.users.create()
    await factories.patron_mode_events.create(
        user_address=patron.address, patron_mode_enabled=True
    )
    await factories.uniqueness_quotients.create(user=patron, epoch=11, score=20.0)
    await factories.budgets.create(user=patron, epoch=11, amount=60_000)

    fast_app.dependency_overrides[get_projects_contracts] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_pending_epoch] = lambda: 11

    async with fast_client as client:
        resp = await client.get("snapshots/finalized/simulate")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Staking portion: 0 (locked ratio >= TR)
        staking_reserved = int(result["stakingMatchedReservedForV2"])
        assert staking_reserved == 0, "No staking contribution when locked_ratio >= TR"

        # Matched rewards for distribution = patron rewards only
        matched_rewards = int(result["matchedRewards"])
        patron_rewards = int(result["patronsRewards"])
        assert matched_rewards == patron_rewards == 60_000


@pytest.mark.asyncio
async def test_e11_with_no_patrons(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    E11 with no patron users: patron_rewards = 0, matched_rewards = 0.
    Staking portion still calculated and reserved.
    """
    project_addresses = ["0x1234567890123456789012345678901234567890"]

    mock_projects_contracts = MagicMock()
    mock_projects_contracts.get_project_addresses = AsyncMock(return_value=project_addresses)

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=11, start=1000, duration=1000, decision_window=1000, remaining_sec=0
        )
    )

    # Create E11 pending snapshot
    await factories.pending_snapshots.create(
        epoch=11,
        eth_proceeds=1_000_000,
        total_effective_deposit=400_000,
        locked_ratio=0.4,
        total_rewards=800_000,
        vanilla_individual_rewards=400_000,
        operational_cost=100_000,
        ppf=50_000,
        community_fund=25_000,
    )

    # Create only normal users (no patrons)
    alice = await factories.users.create()
    await factories.uniqueness_quotients.create(user=alice, epoch=11, score=20.0)
    await factories.budgets.create(user=alice, epoch=11, amount=100_000)

    await factories.allocations.create(
        user=alice, epoch=11, nonce=1, amount=50_000, project_address=project_addresses[0]
    )

    fast_app.dependency_overrides[get_projects_contracts] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_pending_epoch] = lambda: 11

    async with fast_client as client:
        resp = await client.get("snapshots/finalized/simulate")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # No patrons means no patron rewards
        patron_rewards = int(result["patronsRewards"])
        assert patron_rewards == 0, "No patron rewards without patrons"

        # Matched rewards = patron rewards = 0
        matched_rewards = int(result["matchedRewards"])
        assert matched_rewards == 0, "No QF matching without patron rewards in E11"

        # But staking portion is still calculated: (0.7 - 0.4) * 1_000_000 = 300_000
        staking_reserved = int(result["stakingMatchedReservedForV2"])
        assert staking_reserved == 300_000, "Staking portion should still be calculated"

        # Projects receive only direct donations (no matching)
        projects = result["projectsRewards"]
        if len(projects) > 0:
            for project in projects:
                assert int(project["matched"]) == 0, "No QF matching without patron rewards"


@pytest.mark.asyncio
async def test_standard_epoch_no_staking_reservation(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    Standard epoch (not E11): Should NOT reserve staking, use normal matched rewards logic.
    """
    project_addresses = ["0x1234567890123456789012345678901234567890"]

    mock_projects_contracts = MagicMock()
    mock_projects_contracts.get_project_addresses = AsyncMock(return_value=project_addresses)

    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=10,  # Standard epoch (not E11)
            start=1000,
            duration=1000,
            decision_window=1000,
            remaining_sec=0,
        )
    )

    # Create E10 pending snapshot with same parameters as E11 test
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

    # Create patron user
    patron = await factories.users.create()
    await factories.patron_mode_events.create(
        user_address=patron.address, patron_mode_enabled=True
    )
    await factories.uniqueness_quotients.create(user=patron, epoch=10, score=20.0)
    await factories.budgets.create(user=patron, epoch=10, amount=150_000)

    fast_app.dependency_overrides[get_projects_contracts] = lambda: mock_projects_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_pending_epoch] = lambda: 10

    async with fast_client as client:
        resp = await client.get("snapshots/finalized/simulate")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Standard epoch: NO staking reservation
        staking_reserved = int(result["stakingMatchedReservedForV2"])
        assert staking_reserved == 0, "Standard epochs should not reserve staking"

        # Standard epoch: matched_rewards = staking_portion + patron_rewards
        # (0.7 - 0.5) * 1_000_000 + 150_000 = 200_000 + 150_000 = 350_000
        matched_rewards = int(result["matchedRewards"])
        patron_rewards = int(result["patronsRewards"])
        expected_matched = 200_000 + 150_000  # staking + patron
        assert matched_rewards == expected_matched, "Standard epoch includes staking in matched rewards"
        assert patron_rewards == 150_000

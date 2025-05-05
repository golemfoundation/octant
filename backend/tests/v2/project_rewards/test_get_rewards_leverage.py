from fastapi import FastAPI
import pytest
from http import HTTPStatus
from unittest.mock import MagicMock
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import InvalidEpoch, NotImplementedForGivenEpochState
from tests.v2.fake_subgraphs.helpers import FakeEpochEventDetails
from tests.v2.fake_subgraphs.conftest import FakeEpochsSubgraphCallable
from v2.matched_rewards.services import MatchedRewardsEstimator
from tests.v2.factories import FactoriesAggregator
from tests.v2.fake_contracts.helpers import FakeEpochsContractDetails
from tests.v2.fake_contracts.conftest import FakeEpochsContractCallable
from v2.matched_rewards.dependencies import get_matched_rewards_estimator


@pytest.mark.asyncio
async def test_returns_leverage_for_finalized_epoch(
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
):
    """Should return leverage based on finalized snapshot for finalized epoch"""
    # Given: a finalized epoch with snapshot and allocations
    epoch_number = 1

    # Mock contracts to return finalized state
    fake_epochs_contract_factory(
        FakeEpochsContractDetails(
            current_epoch=epoch_number + 1,  # Current epoch is ahead
            finalized_epoch=epoch_number,
            pending_epoch=None,
        )
    )

    # Mock subgraph to return finalized epoch details
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=epoch_number,
                from_ts=0,
                duration=10000,
                decision_window=3000,
            )
        ]
    )

    # Create pending snapshot
    await factories.pending_snapshots.create(
        epoch=epoch_number,
    )

    # Create finalized snapshot
    finalized_snapshot = await factories.finalized_snapshots.create(
        epoch=epoch_number,
    )

    # Create some allocations
    alice = await factories.users.get_or_create_alice()
    alice_allocation = await factories.allocations.create(
        user=alice,
        epoch=epoch_number,
    )

    async with fast_client as client:
        resp = await client.get(f"rewards/leverage/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK
        resp_leverage = int(resp.json()["leverage"])
        expected_leverage = int(
            int(finalized_snapshot.matched_rewards) / int(alice_allocation.amount)
        )
        assert resp_leverage == expected_leverage


@pytest.mark.asyncio
async def test_returns_leverage_for_pending_epoch(
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fast_app: FastAPI,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
):
    """Should return leverage based on estimated rewards for pending epoch"""
    # Given: a pending epoch with allocations
    epoch_number = 1
    estimated_rewards = 100_000_000

    # Mock contracts to return pending state
    fake_epochs_contract_factory(
        FakeEpochsContractDetails(
            current_epoch=epoch_number + 1,  # Current epoch is ahead
            finalized_epoch=epoch_number,
            pending_epoch=None,
        )
    )

    # Mock subgraph to return pending epoch details
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=epoch_number,
                from_ts=0,
                duration=10000,
                decision_window=3000,
            )
        ]
    )

    # Create pending snapshot
    await factories.pending_snapshots.create(
        epoch=epoch_number,
    )

    # Create some allocations
    alice = await factories.users.get_or_create_alice()
    alice_allocation = await factories.allocations.create(
        user=alice,
        epoch=epoch_number,
    )

    # Mock rewards estimator
    rewards_estimator = MagicMock(spec=MatchedRewardsEstimator)
    rewards_estimator.get.return_value = estimated_rewards
    fast_app.dependency_overrides[
        get_matched_rewards_estimator
    ] = lambda: rewards_estimator

    async with fast_client as client:
        resp = await client.get(f"rewards/leverage/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"leverage": estimated_rewards / alice_allocation.amount}


@pytest.mark.asyncio
async def test_returns_zero_leverage_when_no_allocations(
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
):
    """Should return zero leverage when there are no allocations"""
    # Given: a finalized epoch with snapshot but no allocations
    epoch_number = 1
    matched_rewards = 1000 * 10**18

    # Mock contracts to return finalized state
    fake_epochs_contract_factory(
        FakeEpochsContractDetails(
            current_epoch=2,
            finalized_epoch=epoch_number,
        )
    )

    # Mock subgraph to return finalized epoch details
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=epoch_number,
                from_ts=0,
                duration=10000,
                decision_window=3000,
            )
        ]
    )

    # Create pending snapshot
    await factories.pending_snapshots.create(
        epoch=epoch_number,
    )

    # Create finalized snapshot
    await factories.finalized_snapshots.create(
        epoch=epoch_number,
        matched_rewards=matched_rewards,
    )

    async with fast_client as client:
        resp = await client.get(f"rewards/leverage/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"leverage": 0}


@pytest.mark.asyncio
async def test_raises_error_when_snapshot_missing(
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
):
    """Should raise MissingSnapshot when finalized snapshot is missing"""
    # Given: a finalized epoch without snapshot
    epoch_number = 1

    # Mock contracts to return finalized state
    fake_epochs_contract_factory(
        FakeEpochsContractDetails(
            current_epoch=2,
            finalized_epoch=epoch_number,
        )
    )

    # Mock subgraph to return finalized epoch details
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=epoch_number,
                from_ts=0,
                duration=10000,
                decision_window=3000,
            )
        ]
    )

    async with fast_client as client:
        resp = await client.get(f"rewards/leverage/{epoch_number}")
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert resp.json() == {"message": InvalidEpoch.description}


@pytest.mark.asyncio
async def test_raises_error_for_invalid_epoch_state(
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
):
    """Should raise NotImplementedForGivenEpochState for invalid epoch state"""
    # Given: an epoch in invalid state (after PENDING)
    epoch_number = 1

    # Mock contracts to return future epoch
    fake_epochs_contract_factory(
        FakeEpochsContractDetails(
            current_epoch=1,
            finalized_epoch=0,
            future_epoch_props=(0, 0, 2000, 1000),  # Future epoch
        )
    )

    # Mock subgraph to return future epoch details
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=epoch_number,
                from_ts=0,
                duration=10000,
                decision_window=3000,
            )
        ]
    )

    async with fast_client as client:
        resp = await client.get(f"rewards/leverage/{epoch_number}")
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert resp.json() == {"message": NotImplementedForGivenEpochState.description}

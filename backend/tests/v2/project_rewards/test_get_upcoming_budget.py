from unittest.mock import MagicMock
import pytest
from http import HTTPStatus
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.engine.user.effective_deposit import DepositEvent, DepositSource, EventType
from v2.deposits.dependencies import (
    GetDepositEventsRepository,
    get_deposit_events_repository,
)
from tests.v2.factories import FactoriesAggregator
from tests.v2.fake_contracts.helpers import FakeEpochsContractDetails
from tests.v2.fake_contracts.conftest import FakeEpochsContractCallable
from tests.v2.fake_subgraphs.conftest import FakeEpochsSubgraphCallable
from tests.v2.fake_subgraphs.helpers import FakeEpochEventDetails
from fastapi import FastAPI
from v2.core.dependencies import get_current_timestamp


@pytest.mark.asyncio
async def test_returns_upcoming_budget_with_no_deposits(
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return zero budget when user has no deposits"""
    # Given: a user and mocked epoch data
    alice = await factories.users.get_or_create_alice()
    current_epoch = 1
    epoch_start = 0

    # Mock contracts and subgraph
    fake_epochs_contract_factory(FakeEpochsContractDetails(current_epoch=current_epoch))

    # Mock subgraph response
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=current_epoch,
                from_ts=epoch_start,
                to_ts=2000,
            )
        ]
    )

    events_repository = MagicMock(spec=GetDepositEventsRepository)
    events_repository.get_all_users_events.return_value = {}
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: events_repository

    async with fast_client as client:
        resp = await client.get(f"rewards/budget/{alice.address}/upcoming")
        assert resp.json() == {"upcomingBudget": "0"}
        assert resp.status_code == HTTPStatus.OK


@pytest.mark.asyncio
async def test_returns_upcoming_budget_with_deposits(
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fast_app: FastAPI,
):
    """Should calculate and return upcoming budget based on user's deposits"""
    # Given: a user and mocked epoch data
    alice = await factories.users.get_or_create_alice()
    current_epoch = 1
    current_timestamp = 1000
    epoch_start = 0
    deposit_amount = 100 * 10**18  # 100 tokens

    # Mock contracts and subgraph
    fake_epochs_contract_factory(FakeEpochsContractDetails(current_epoch=current_epoch))

    # Mock subgraph response
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=current_epoch,
                from_ts=epoch_start,
                to_ts=2000,
            )
        ]
    )

    events_repository = MagicMock(spec=GetDepositEventsRepository)
    events_repository.get_all_users_events.return_value = {
        alice.address: [
            DepositEvent(
                user=alice.address,
                type=EventType.LOCK,
                timestamp=epoch_start + 100,
                amount=deposit_amount,
                deposit_before=0,
                source=DepositSource.OCTANT,
            )
        ]
    }
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: events_repository
    fast_app.dependency_overrides[get_current_timestamp] = lambda: current_timestamp

    async with fast_client as client:
        resp = await client.get(f"rewards/budget/{alice.address}/upcoming")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() != {"upcomingBudget": "0"}

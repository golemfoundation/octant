from http import HTTPStatus
from unittest.mock import MagicMock
from fastapi import FastAPI
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.engine.user.effective_deposit import DepositEvent, DepositSource, EventType
from tests.v2.fake_subgraphs.conftest import (
    FakeEpochsSubgraphCallable,
)
from tests.v2.fake_subgraphs.helpers import FakeEpochEventDetails
from v2.core.dependencies import get_current_timestamp
from v2.deposits.dependencies import (
    GetDepositEventsRepository,
    get_deposit_events_repository,
)
from tests.v2.factories import FactoriesAggregator
from tests.v2.fake_contracts.helpers import FakeEpochsContractDetails
from tests.v2.fake_contracts.conftest import FakeEpochsContractCallable
from v2.core.types import Address


@pytest.mark.asyncio
async def test_get_user_effective_deposit_current_epoch(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
):
    """Should redirect to estimated API when querying current epoch"""
    # Setup
    current_epoch = 1
    epoch_start = 1000000
    current_timestamp = 1200000

    # Mock the epochs_contracts
    fake_epochs_contract_factory(FakeEpochsContractDetails(current_epoch=current_epoch))

    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=current_epoch,
                from_ts=epoch_start,
            )
        ]
    )

    # Setup dependency overrides
    alice = await factories.users.get_or_create_alice()
    events_repository = MagicMock(spec=GetDepositEventsRepository)
    events_repository.get_all_user_events.return_value = [
        DepositEvent(
            user=alice.address,
            type=EventType.LOCK,
            timestamp=epoch_start,
            amount=100 * 10**18,
            deposit_before=0,
            source=DepositSource.OCTANT,
        )
    ]
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: events_repository

    fast_app.dependency_overrides[get_current_timestamp] = lambda: current_timestamp

    async with fast_client as client:
        resp = await client.get(f"deposits/users/{alice.address}/{current_epoch}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"effectiveDeposit": str(100 * 10**18)}


@pytest.mark.asyncio
async def test_get_user_effective_deposit_past_epoch_success(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
):
    """Should return the effective deposit for a user in a past epoch"""
    # Setup
    user_address = Address("0x1234567890123456789012345678901234567890")
    past_epoch = 3
    current_epoch = 5
    effective_deposit = str(200 * 10**18)

    # Create fake user
    user = await factories.users.create(address=user_address)

    # Create a deposit record for the user in the past epoch
    await factories.deposits.create(
        user=user,
        epoch=past_epoch,
        effective_deposit=effective_deposit,
    )

    # Mock the epochs_contracts to return our fixed current epoch
    fake_epochs_contract_factory(FakeEpochsContractDetails(current_epoch=current_epoch))
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=current_epoch,
                from_ts=1000000,
            )
        ]
    )
    events_repository = MagicMock(spec=GetDepositEventsRepository)
    events_repository.get_all_user_events.return_value = [
        DepositEvent(
            user=user_address,
            type=EventType.LOCK,
            timestamp=1000000,
            amount=100 * 10**18,
            deposit_before=0,
            source=DepositSource.OCTANT,
        )
    ]
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: events_repository

    async with fast_client as client:
        resp = await client.get(f"deposits/users/{user_address}/{past_epoch}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"effectiveDeposit": str(effective_deposit)}


@pytest.mark.asyncio
async def test_get_user_effective_deposit_not_found(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
):
    """Should return 404 if a deposit does not exist for the user in that epoch"""
    # Setup
    user_address = Address("0x1234567890123456789012345678901234567890")
    past_epoch = 3
    current_epoch = 5

    # Create fake user but no deposit
    await factories.users.create(address=user_address)

    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=current_epoch,
                from_ts=1000000,
            )
        ]
    )
    events_repository = MagicMock(spec=GetDepositEventsRepository)
    events_repository.get_all_user_events.return_value = []
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: events_repository

    # Mock the epochs_contracts to return our fixed current epoch
    fake_epochs_contract_factory(FakeEpochsContractDetails(current_epoch=current_epoch))

    async with fast_client as client:
        resp = await client.get(f"deposits/users/{user_address}/{past_epoch}")
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "not found" in resp.json()["message"]

from http import HTTPStatus
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.v2.factories import FactoriesAggregator
from v2.core.dependencies import get_w3
from v2.epochs.dependencies import get_epochs_contracts, get_epochs_subgraph


@pytest.mark.asyncio
async def test_get_sync_status(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    monkeypatch,
):
    """Should return sync status for all services"""
    monkeypatch.setenv("CHAIN_ID", "1")

    # Step 2: Mock the web3 chain_id property
    mock_w3 = MagicMock()
    mock_w3.eth = MagicMock()
    type(mock_w3.eth).chain_id = MagicMock()
    type(mock_w3.eth).chain_id.__get__ = AsyncMock(return_value=1)
    # The result of get_block is a dictionary-like object
    mock_w3.eth.get_block = AsyncMock(return_value={"number": 123456})

    # Step 3: Mock the epochs contracts
    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_current_epoch = AsyncMock(return_value=10)

    # Step 4: Mock the epochs subgraph
    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_indexed_block_num = AsyncMock(return_value=123450)
    mock_epochs_subgraph.get_last_indexed_epoch_and_height = AsyncMock(
        return_value=(9, 123450)
    )

    # Step 5: Setup mock for pending and finalized snapshot status
    await factories.pending_snapshots.create(9)
    await factories.finalized_snapshots.create(9)

    mock_epochs_contracts.is_decision_window_open = AsyncMock(return_value=False)

    # Step 6: Override the dependencies
    fast_app.dependency_overrides[get_w3] = lambda: mock_w3
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph

    # Step 7: Test the endpoint
    async with fast_client as client:
        resp = await client.get("info/sync-status")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Step 8: Verify the values match our mocks
        assert result["blockchainEpoch"] == 10
        assert result["indexedEpoch"] == 9
        assert result["blockchainHeight"] == 123456
        assert result["indexedHeight"] == 123450
        assert result["pendingSnapshot"] == "done"
        assert result["finalizedSnapshot"] == "done"


@pytest.mark.asyncio
async def test_get_sync_status_service_down(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    monkeypatch,
):
    """Should return 500 when services are not available"""
    # Step 1: Set environment variables
    monkeypatch.setenv("CHAIN_ID", "1")

    # Step 2: Mock the web3 dependency to fail
    mock_w3 = MagicMock()
    mock_w3.eth.chain_id = AsyncMock(side_effect=Exception("RPC Error"))

    # Step 3: Mock the epochs contracts
    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_current_epoch = AsyncMock(
        side_effect=Exception("Epochs Contracts Error")
    )

    # Step 4: Mock the epochs subgraph
    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_indexed_block_num = AsyncMock(
        side_effect=Exception("Subgraph Error")
    )

    # Step 5: Override the dependencies
    fast_app.dependency_overrides[get_w3] = lambda: mock_w3
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph

    # Step 6: Test the endpoint
    async with fast_client as client:
        resp = await client.get("info/sync-status")
        assert resp.status_code == HTTPStatus.INTERNAL_SERVER_ERROR

        result = resp.json()
        assert result["blockchainEpoch"] is None
        assert result["indexedEpoch"] is None
        assert result["blockchainHeight"] is None
        assert result["indexedHeight"] is None
        assert result["pendingSnapshot"] is None
        assert result["finalizedSnapshot"] is None

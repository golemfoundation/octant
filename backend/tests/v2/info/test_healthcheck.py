from http import HTTPStatus
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from v2.core.dependencies import get_chain_settings, get_sessionmaker, get_w3
from v2.epochs.dependencies import get_epochs_subgraph


@pytest.mark.asyncio
async def test_get_healthcheck_all_healthy(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    monkeypatch,
):
    """Should return UP for all services when healthy"""
    # Step 1: Set environment variables
    monkeypatch.setenv("CHAIN_ID", "1")

    # Step 2: Mock the web3 chain_id property
    mock_w3 = MagicMock()
    mock_w3.eth = MagicMock()
    type(mock_w3.eth).chain_id = MagicMock()
    type(mock_w3.eth).chain_id.__get__ = AsyncMock(return_value=1)

    # Step 3: Mock the epochs subgraph
    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_indexed_block_num = AsyncMock(return_value=123456)

    # Step 5: Override the dependencies
    fast_app.dependency_overrides[get_w3] = lambda: mock_w3
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph

    # Step 6: Test the endpoint
    async with fast_client as client:
        resp = await client.get("info/healthcheck")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Step 7: Verify all services are UP
        assert result["blockchain"] == "UP"
        assert result["db"] == "UP"
        assert result["subgraph"] == "UP"


@pytest.mark.asyncio
async def test_get_healthcheck_services_misconfigured(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    monkeypatch,
):
    """Should return DOWN for services that are misconfigured and 500 status"""
    # Step 1: Set environment variables
    monkeypatch.setenv("CHAIN_ID", "1")

    # Step 2: Mock the web3 chain_id property
    mock_w3 = MagicMock()
    mock_w3.eth = MagicMock()
    type(mock_w3.eth).chain_id = MagicMock()
    type(mock_w3.eth).chain_id.__get__ = AsyncMock(return_value=2)

    # Step 3: Mock the epochs subgraph to fail
    mock_epochs_subgraph = MagicMock()
    mock_epochs_subgraph.get_indexed_block_num = AsyncMock(
        side_effect=Exception("Subgraph Error")
    )

    # Step 5: Mock the database to fail
    mock_sessionmaker = MagicMock()
    mock_sessionmaker.return_value = AsyncMock(side_effect=Exception("Database Error"))

    # Step 4: Mock the chain settings
    mock_chain_settings = MagicMock()
    mock_chain_settings.chain_id = 1

    # Step 5: Override the dependencies
    fast_app.dependency_overrides[get_w3] = lambda: mock_w3
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: mock_epochs_subgraph
    fast_app.dependency_overrides[get_chain_settings] = lambda: mock_chain_settings
    fast_app.dependency_overrides[get_sessionmaker] = lambda: mock_sessionmaker

    # Step 6: Test the endpoint
    async with fast_client as client:
        resp = await client.get("info/healthcheck")
        assert resp.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
        result = resp.json()

        # Step 7: Verify services are DOWN
        assert result["blockchain"] == "DOWN"
        assert result["subgraph"] == "DOWN"
        assert result["db"] == "DOWN"

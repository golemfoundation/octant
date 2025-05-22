from http import HTTPStatus
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories import FactoriesAggregator
from v2.epochs.dependencies import get_epochs_contracts


@pytest.mark.asyncio
async def test_get_snapshot_status_current_epoch(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return correct status for current epoch"""
    # Mock dependencies
    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_current_epoch = AsyncMock(return_value=1)
    mock_epochs_contracts.get_pending_epoch = AsyncMock(return_value=1)
    mock_epochs_contracts.get_finalized_epoch = AsyncMock(return_value=0)

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/status/1")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()
        assert result["isCurrent"] is True
        assert result["isPending"] is False
        assert result["isFinalized"] is False


@pytest.mark.asyncio
async def test_get_snapshot_status_pending_epoch(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    monkeypatch,
    factories: FactoriesAggregator,
):
    """Should return correct status for pending epoch"""
    # Mock dependencies
    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_current_epoch = AsyncMock(return_value=2)
    mock_epochs_contracts.get_pending_epoch = AsyncMock(return_value=1)
    mock_epochs_contracts.get_finalized_epoch = AsyncMock(return_value=0)

    # Mock pending snapshot
    await factories.pending_snapshots.create(epoch=1)

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/status/1")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()
        assert result["isCurrent"] is False
        assert result["isPending"] is True
        assert result["isFinalized"] is False


@pytest.mark.asyncio
async def test_get_snapshot_status_pending_epoch_but_no_snapshot(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    monkeypatch,
    factories: FactoriesAggregator,
):
    """Should return correct status for pending epoch as false because no snapshot"""
    # Mock dependencies
    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_current_epoch = AsyncMock(return_value=2)
    mock_epochs_contracts.get_pending_epoch = AsyncMock(return_value=1)
    mock_epochs_contracts.get_finalized_epoch = AsyncMock(return_value=0)

    # Mock pending snapshot

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/status/1")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()
        assert result["isCurrent"] is False
        assert result["isPending"] is False
        assert result["isFinalized"] is False


@pytest.mark.asyncio
async def test_get_snapshot_status_finalized_epoch(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    monkeypatch,
    factories: FactoriesAggregator,
):
    """Should return correct status for finalized epoch"""
    # Mock dependencies
    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_current_epoch = AsyncMock(return_value=2)
    mock_epochs_contracts.get_pending_epoch = AsyncMock(return_value=1)
    mock_epochs_contracts.get_finalized_epoch = AsyncMock(return_value=1)

    # Mock finalized snapshot
    await factories.finalized_snapshots.create(epoch=1)

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/status/1")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()
        assert result["isCurrent"] is False
        assert result["isPending"] is False
        assert result["isFinalized"] is True


@pytest.mark.asyncio
async def test_get_snapshot_status_finalized_epoch_but_no_snapshot(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    monkeypatch,
    factories: FactoriesAggregator,
):
    """Should return correct status for finalized epoch as false because no snapshot"""
    # Mock dependencies
    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_current_epoch = AsyncMock(return_value=2)
    mock_epochs_contracts.get_pending_epoch = AsyncMock(return_value=1)
    mock_epochs_contracts.get_finalized_epoch = AsyncMock(return_value=1)

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/status/1")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()
        assert result["isCurrent"] is False
        assert result["isPending"] is False
        assert result["isFinalized"] is False


@pytest.mark.asyncio
async def test_get_snapshot_status_future_epoch(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    monkeypatch,
):
    """Should raise error for future epoch"""
    # Mock dependencies
    mock_epochs_contracts = MagicMock()
    mock_epochs_contracts.get_current_epoch = AsyncMock(return_value=2)
    mock_epochs_contracts.get_pending_epoch = AsyncMock(return_value=1)
    mock_epochs_contracts.get_finalized_epoch = AsyncMock(return_value=0)

    # Override dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: mock_epochs_contracts

    # Test endpoint
    async with fast_client as client:
        resp = await client.get("snapshots/status/3")
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "not yet started" in resp.json()["message"]

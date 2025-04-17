from http import HTTPStatus
from fastapi import FastAPI
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories import FactoriesAggregator
from v2.epoch_snapshots.repositories import get_pending_epoch_snapshot


# Helper function to create mock for get_pending_epoch_snapshot
def mock_get_pending_epoch_snapshot_factory(snapshot=None):
    async def mock_get_pending_epoch_snapshot(*args, **kwargs):
        return snapshot

    return mock_get_pending_epoch_snapshot


@pytest.mark.asyncio
async def test_get_total_effective_deposit_success(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return the total effective deposit for a valid epoch"""
    # Create a pending epoch snapshot
    epoch_number = 1
    total_effective = 1000000000000

    await factories.pending_snapshots.create(
        epoch=epoch_number,
        total_effective_deposit=total_effective,
    )

    async with fast_client as client:
        resp = await client.get(f"deposits/{epoch_number}/total_effective")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"totalEffective": str(total_effective)}


@pytest.mark.asyncio
async def test_get_total_effective_deposit_invalid_epoch(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return 404 if the epoch doesn't exist"""
    # Setup dependency overrides
    fast_app.dependency_overrides[
        get_pending_epoch_snapshot
    ] = mock_get_pending_epoch_snapshot_factory(None)

    async with fast_client as client:
        resp = await client.get("deposits/999/total_effective")

        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "epoch is not valid" in resp.json()["message"]

from http import HTTPStatus
from decimal import Decimal
from fastapi import FastAPI
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories import FactoriesAggregator


@pytest.mark.asyncio
async def test_get_locked_ratio_success(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return the locked ratio for a valid epoch"""
    # Create a pending epoch snapshot
    epoch_number = 1
    locked_ratio = Decimal("0.75")

    await factories.pending_snapshots.create(
        epoch=epoch_number,
        locked_ratio=locked_ratio,
    )

    async with fast_client as client:
        resp = await client.get(f"deposits/{epoch_number}/locked_ratio")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"lockedRatio": str(locked_ratio)}


@pytest.mark.asyncio
async def test_get_locked_ratio_invalid_epoch(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return 404 if the epoch doesn't exist"""
    # Setup dependency overrides

    async with fast_client as client:
        resp = await client.get("deposits/999/locked_ratio")

        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "epoch is not valid" in resp.json()["message"]

from http import HTTPStatus

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.staking.proceeds.core import ESTIMATED_STAKING_REWARDS_RATE


@pytest.mark.asyncio
async def test_returns_correct_rewards_rate(
    fast_client: AsyncClient, fast_session: AsyncSession
):
    expected_rewards_rate = ESTIMATED_STAKING_REWARDS_RATE
    epoch_number = 1

    async with fast_client as client:
        resp = await client.get(f"epochs/rewards-rate/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"rewards_rate": expected_rewards_rate}


@pytest.mark.asyncio
async def test_validates_invalid_epoch(
    fast_client: AsyncClient, fast_session: AsyncSession
):
    epoch_number = -1  # Epoch number must be positive

    async with fast_client as client:
        resp = await client.get(f"epochs/rewards-rate/{epoch_number}")
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert resp.json() == {"message": "Given epoch is not valid."}

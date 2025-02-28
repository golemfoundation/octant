from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from fastapi import FastAPI
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import (
    LOW_UQ_SCORE,
    MAX_UQ_SCORE,
    NULLIFIED_UQ_SCORE,
    UQ_THRESHOLD_MAINNET,
)
from v2.uniqueness_quotients.dependencies import get_uq_score_getter
from v2.uniqueness_quotients.services import UQScoreGetter
from tests.v2.factories import FactoriesAggregator


@pytest.mark.asyncio
async def test_get_antisybil_status_normal_user(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return the antisybil status for a normal user"""
    alice = await factories.users.get_or_create_alice()

    # Create a gp stamps for the user
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    expires_ts = int(expires_at.timestamp())
    await factories.gp_stamps.create(
        user=alice,
        score=7.0,
        expires_at=expires_at,
    )

    # Override uq_score_getter
    fake_uq_score_getter = UQScoreGetter(
        session=fast_session,
        uq_score_threshold=UQ_THRESHOLD_MAINNET,
        max_uq_score=MAX_UQ_SCORE,
        low_uq_score=LOW_UQ_SCORE,
        null_uq_score=NULLIFIED_UQ_SCORE,
        guest_list=set(),
        timeout_list=set(),
    )
    fast_app.dependency_overrides[get_uq_score_getter] = lambda: fake_uq_score_getter

    async with fast_client as client:
        resp = await client.get(f"user/{alice.address}/antisybil-status")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "status": "Known",
            "score": "7.0",
            "expiresAt": str(expires_ts),
            "isOnTimeOutList": False,
        }


@pytest.mark.asyncio
async def test_get_antisybil_status_timeout_list_user(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return the antisybil status for a user on timeout list"""
    bob = await factories.users.get_or_create_bob()

    # Create a gp stamps for the user
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    expires_ts = int(expires_at.timestamp())
    await factories.gp_stamps.create(
        user=bob,
        score=100.0,  # High score but on timeout list
        expires_at=expires_at,
    )

    # Override uq_score_getter with bob on timeout list
    fake_uq_score_getter = UQScoreGetter(
        session=fast_session,
        uq_score_threshold=UQ_THRESHOLD_MAINNET,
        max_uq_score=MAX_UQ_SCORE,
        low_uq_score=LOW_UQ_SCORE,
        null_uq_score=NULLIFIED_UQ_SCORE,
        guest_list=set(),
        timeout_list=set([bob.address]),
    )
    fast_app.dependency_overrides[get_uq_score_getter] = lambda: fake_uq_score_getter

    async with fast_client as client:
        resp = await client.get(f"user/{bob.address}/antisybil-status")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "status": "Known",
            "score": "0.0",
            "expiresAt": str(expires_ts),
            "isOnTimeOutList": True,
        }


@pytest.mark.asyncio
async def test_get_antisybil_status_guest_list_user(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return the antisybil status for a user on guest list"""
    charlie = await factories.users.get_or_create_charlie()

    # Create a gp stamps for the user
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    expires_ts = int(expires_at.timestamp())
    await factories.gp_stamps.create(
        user=charlie,
        score=0.0,  # Low score but on guest list
        expires_at=expires_at,
    )

    # Override uq_score_getter with charlie on guest list
    fake_uq_score_getter = UQScoreGetter(
        session=fast_session,
        uq_score_threshold=UQ_THRESHOLD_MAINNET,
        max_uq_score=MAX_UQ_SCORE,
        low_uq_score=LOW_UQ_SCORE,
        null_uq_score=NULLIFIED_UQ_SCORE,
        guest_list=set([charlie.address]),
        timeout_list=set(),
    )
    fast_app.dependency_overrides[get_uq_score_getter] = lambda: fake_uq_score_getter

    async with fast_client as client:
        resp = await client.get(f"user/{charlie.address}/antisybil-status")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "status": "Known",
            "score": "21.0",
            "expiresAt": str(expires_ts),
            "isOnTimeOutList": False,
        }


@pytest.mark.asyncio
async def test_get_antisybil_status_no_gp_stamps(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return 404 when user has no GPStamps record"""
    # Create user but don't create any GPStamps for them
    alice = await factories.users.get_or_create_alice()

    # Override uq_score_getter with empty lists
    fake_uq_score_getter = UQScoreGetter(
        session=fast_session,
        uq_score_threshold=UQ_THRESHOLD_MAINNET,
        max_uq_score=MAX_UQ_SCORE,
        low_uq_score=LOW_UQ_SCORE,
        null_uq_score=NULLIFIED_UQ_SCORE,
        guest_list=set(),
        timeout_list=set(),
    )
    fast_app.dependency_overrides[get_uq_score_getter] = lambda: fake_uq_score_getter

    async with fast_client as client:
        resp = await client.get(f"user/{alice.address}/antisybil-status")
        assert resp.status_code == HTTPStatus.NOT_FOUND

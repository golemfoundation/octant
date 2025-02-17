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
async def test_get_uq_for_user_and_epoch_happy_path(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return all users who toggled patron mode and have a positive budget"""

    # Mock data
    epoch_number = 1

    # Create users with different roles
    alice = await factories.users.get_or_create_alice()
    bob = await factories.users.get_or_create_bob()
    charlie = await factories.users.get_or_create_charlie()

    # Override uq_score_getter
    fake_uq_score_getter = UQScoreGetter(
        session=fast_session,
        uq_score_threshold=UQ_THRESHOLD_MAINNET,
        max_uq_score=MAX_UQ_SCORE,
        low_uq_score=LOW_UQ_SCORE,
        null_uq_score=NULLIFIED_UQ_SCORE,
        guest_list=set([alice.address]),
        timeout_list=set([bob.address]),
    )
    fast_app.dependency_overrides[get_uq_score_getter] = lambda: fake_uq_score_getter

    async with fast_client as client:
        # Alice is in the guest list = max uq score
        resp = await client.get(f"user/{alice.address}/uq/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"uniquenessQuotient": str(MAX_UQ_SCORE)}

        # Bob is in the timeout list = nullified uq score
        resp = await client.get(f"user/{bob.address}/uq/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"uniquenessQuotient": str(NULLIFIED_UQ_SCORE)}

        # Charlie is not in the guest list or timeout list = default low uq score
        resp = await client.get(f"user/{charlie.address}/uq/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"uniquenessQuotient": str(LOW_UQ_SCORE)}


@pytest.mark.asyncio
async def test_get_uq_for_user_and_epoch_no_user(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return 404 if user does not exist"""

    # Create users with different roles
    await factories.users.get_or_create_alice()
    await factories.users.get_or_create_bob()
    await factories.users.get_or_create_charlie()

    async with fast_client as client:
        # Alice is in the guest list = max uq score
        resp = await client.get("user/uq/1/all")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"uqsInfo": []}


@pytest.mark.asyncio
async def test_get_uq_for_user_and_epoch_some_users_have_uqs(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return 404 if user does not exist"""

    # Create users with different roles
    alice = await factories.users.get_or_create_alice()
    bob = await factories.users.get_or_create_bob()
    charlie = await factories.users.get_or_create_charlie()

    await factories.uniqueness_quotients.create(user=alice, epoch=1, score=MAX_UQ_SCORE)
    await factories.uniqueness_quotients.create(user=bob, epoch=1, score=LOW_UQ_SCORE)
    await factories.uniqueness_quotients.create(
        user=charlie, epoch=1, score=NULLIFIED_UQ_SCORE
    )

    async with fast_client as client:
        # Alice is in the guest list = max uq score
        resp = await client.get("user/uq/1/all")
        assert resp.status_code == HTTPStatus.OK

        uqs_map = {
            r["userAddress"]: r["uniquenessQuotient"] for r in resp.json()["uqsInfo"]
        }

        assert uqs_map[alice.address] == str(MAX_UQ_SCORE)
        assert uqs_map[bob.address] == str(LOW_UQ_SCORE)
        assert uqs_map[charlie.address] == str(NULLIFIED_UQ_SCORE)

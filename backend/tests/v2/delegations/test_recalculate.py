from http import HTTPStatus
from fastapi import FastAPI
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


from v2.delegations.dependencies import (
    DelegationSettings,
    get_delegation_service,
    get_delegation_settings,
)
from tests.v2.factories import FactoriesAggregator


def fake_delegation_settings() -> DelegationSettings:
    return DelegationSettings(
        delegation_salt_primary="primary_salt",
        delegation_salt="secondary_salt",
    )


@pytest.mark.asyncio
async def test_recalculate_delegation(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    delegation_settings = fake_delegation_settings()
    fast_app.dependency_overrides[get_delegation_settings] = lambda: delegation_settings
    delegation_service = get_delegation_service(fast_session, delegation_settings)

    alice = await factories.users.get_or_create_alice()
    bob = await factories.users.get_or_create_bob()

    primary_hash = delegation_service.hash_primary(alice.address)
    secondary_hash = delegation_service.hash_secondary(bob.address)
    both_hash = delegation_service.hash_both(alice.address, bob.address)

    await factories.score_delegations.create(primary_hash)
    await factories.score_delegations.create(secondary_hash)
    await factories.score_delegations.create(both_hash)

    async with fast_client as client:
        resp = await client.put(
            "delegation/recalculate",
            json={
                "primaryAddr": alice.address,
                "secondaryAddr": bob.address,
                "primaryAddrSignature": "0x123",
                "secondaryAddrSignature": "0x456",
            },
        )

        assert resp.status_code == HTTPStatus.BAD_REQUEST
        # We should see both addresses in the response
        assert "Invalid recalculation request" in resp.json()["message"]


@pytest.mark.asyncio
async def test_recalculate_delegation_not_exists(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    # Settings for the delegation
    delegation_settings = fake_delegation_settings()
    fast_app.dependency_overrides[get_delegation_settings] = lambda: delegation_settings

    alice = await factories.users.get_or_create_alice()
    bob = await factories.users.get_or_create_bob()

    async with fast_client as client:
        resp = await client.put(
            "delegation/recalculate",
            json={
                "primaryAddr": alice.address,
                "secondaryAddr": bob.address,
                "primaryAddrSignature": "0x123",
                "secondaryAddrSignature": "0x456",
            },
        )

        assert resp.status_code == HTTPStatus.BAD_REQUEST
        # We should see both addresses in the response
        assert "Delegation does not exists" in resp.json()["message"]

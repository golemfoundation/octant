import pytest
from fastapi import status
from httpx import AsyncClient

from tests.v2.factories import FactoriesAggregator

"""Test cases for the GET /allocations/users/{user_address}/allocation_nonce endpoint"""


@pytest.mark.asyncio
async def test_returns_nonce_when_no_allocations_exist(
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    """Should return the nonce when it exists"""

    alice = await factories.users.get_or_create_alice()

    async with fast_client as client:
        resp = await client.get(f"allocations/users/{alice.address}/allocation_nonce")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocationNonce": 0}


@pytest.mark.asyncio
async def test_returns_nonce_when_allocations_exist(
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    """Should return the nonce when allocation requests exist"""

    alice = await factories.users.get_or_create_alice()

    async with fast_client as client:
        resp = await client.get(f"allocations/users/{alice.address}/allocation_nonce")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocationNonce": 0}

        await factories.allocations.create(user=alice, epoch=1, nonce=1)

        resp = await client.get(f"allocations/users/{alice.address}/allocation_nonce")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocationNonce": 2}

        await factories.allocations.create(user=alice, epoch=1, nonce=2)

        resp = await client.get(f"allocations/users/{alice.address}/allocation_nonce")
        assert resp.status_code == 200
        assert resp.json() == {"allocationNonce": 3}

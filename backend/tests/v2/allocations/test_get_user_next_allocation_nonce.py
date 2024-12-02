import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import status
from tests.v2.utils import FakeAllocationRequest, FakeUser


"""Test cases for the GET /allocations/users/{user_address}/allocation_nonce endpoint"""


@pytest.mark.asyncio
async def test_returns_nonce_when_no_allocations_exist(
    fast_client: AsyncClient, fast_session: AsyncSession
):
    """Should return the nonce when it exists"""

    alice = await FakeUser.GetAlice(fast_session)

    async with fast_client as client:
        resp = await client.get(f"allocations/users/{alice.address}/allocation_nonce")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocationNonce": 0}


@pytest.mark.asyncio
async def test_returns_nonce_when_allocations_exist(
    fast_client: AsyncClient, fast_session: AsyncSession
):
    """Should return the nonce when allocation requests exist"""

    alice = await FakeUser.GetAlice(fast_session)

    async with fast_client as client:
        resp = await client.get(f"allocations/users/{alice.address}/allocation_nonce")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocationNonce": 0}

        await FakeAllocationRequest.create(fast_session, alice, 1, 0, "", False)
        await fast_session.commit()

        resp = await client.get(f"allocations/users/{alice.address}/allocation_nonce")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocationNonce": 1}

        await FakeAllocationRequest.create(fast_session, alice, 1, 1, "", False)
        await fast_session.commit()

        resp = await client.get(f"allocations/users/{alice.address}/allocation_nonce")
        assert resp.status_code == 200
        assert resp.json() == {"allocationNonce": 2}

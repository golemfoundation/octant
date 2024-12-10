import pytest
<<<<<<< HEAD
from fastapi import status
from httpx import AsyncClient

from tests.v2.factories import FactoriesAggregator
=======
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import status
from tests.v2.utils import FakeAllocationRequest, FakeUser

>>>>>>> master

"""Test cases for the GET /allocations/users/{user_address}/allocation_nonce endpoint"""


@pytest.mark.asyncio
async def test_returns_nonce_when_no_allocations_exist(
<<<<<<< HEAD
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    """Should return the nonce when it exists"""

    alice = await factories.users.get_or_create_alice()
=======
    fast_client: AsyncClient, fast_session: AsyncSession
):
    """Should return the nonce when it exists"""

    alice = await FakeUser.GetAlice(fast_session)
>>>>>>> master

    async with fast_client as client:
        resp = await client.get(f"allocations/users/{alice.address}/allocation_nonce")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocationNonce": 0}


@pytest.mark.asyncio
async def test_returns_nonce_when_allocations_exist(
<<<<<<< HEAD
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    """Should return the nonce when allocation requests exist"""

    alice = await factories.users.get_or_create_alice()
=======
    fast_client: AsyncClient, fast_session: AsyncSession
):
    """Should return the nonce when allocation requests exist"""

    alice = await FakeUser.GetAlice(fast_session)
>>>>>>> master

    async with fast_client as client:
        resp = await client.get(f"allocations/users/{alice.address}/allocation_nonce")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocationNonce": 0}

<<<<<<< HEAD
        await factories.allocations.create(user=alice, epoch=1, nonce=1)

        resp = await client.get(f"allocations/users/{alice.address}/allocation_nonce")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocationNonce": 2}

        await factories.allocations.create(user=alice, epoch=1, nonce=2)

        resp = await client.get(f"allocations/users/{alice.address}/allocation_nonce")
        assert resp.status_code == 200
        assert resp.json() == {"allocationNonce": 3}
=======
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
>>>>>>> master

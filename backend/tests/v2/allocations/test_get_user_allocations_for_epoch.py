import pytest
<<<<<<< HEAD
from fastapi import status
from httpx import AsyncClient

from tests.v2.factories import FactoriesAggregator
=======
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import status
from tests.v2.utils import FakeAllocation, FakeAllocationRequest, FakeUser

>>>>>>> master

"""Test cases for the GET /allocations/user/{user_address}/epoch/{epoch_number} endpoint"""


@pytest.mark.asyncio
async def test_returns_allocations_when_no_allocations_exist(
<<<<<<< HEAD
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    """Should return the allocations when they exist"""

    alice = await factories.users.get_or_create_alice()
=======
    fast_client: AsyncClient, fast_session: AsyncSession
):
    """Should return the allocations when they exist"""

    alice = await FakeUser.GetAlice(fast_session)
>>>>>>> master

    async with fast_client as client:
        resp = await client.get(f"allocations/user/{alice.address}/epoch/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocations": [], "isManuallyEdited": None}


@pytest.mark.asyncio
async def test_returns_nonce_when_allocations_exist(
<<<<<<< HEAD
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    """Should return the allocations when they exist"""

    alice = await factories.users.get_or_create_alice()
=======
    fast_client: AsyncClient, fast_session: AsyncSession
):
    """Should return the allocations when they exist"""

    alice = await FakeUser.GetAlice(fast_session)
>>>>>>> master
    project_1 = "0x433485B5951f250cEFDCbf197Cb0F60fdBE55513"
    project_2 = "0x433485B5951F250cefdcbF197Cb0F60FDBE55514"

    async with fast_client as client:
        resp = await client.get(f"allocations/user/{alice.address}/epoch/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocations": [], "isManuallyEdited": None}

<<<<<<< HEAD
        a_alloc_1 = await factories.allocations.create(
            user=alice, epoch=1, project_address=project_1
        )
=======
        alloc_1 = await FakeAllocation.of_(fast_session, alice.address, 1, project_1)
        await FakeAllocationRequest.create(fast_session, alice, 1, 0, "", False)
        await fast_session.commit()
>>>>>>> master

        resp = await client.get(f"allocations/user/{alice.address}/epoch/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {
<<<<<<< HEAD
            "allocations": [{"address": project_1, "amount": str(a_alloc_1.amount)}],
            "isManuallyEdited": False,
        }

        a_alloc_2 = await factories.allocations.create(
            user=alice, epoch=1, project_address=project_2
        )
=======
            "allocations": [{"address": project_1, "amount": str(alloc_1.amount)}],
            "isManuallyEdited": False,
        }

        alloc_2 = await FakeAllocation.of_(fast_session, alice.address, 1, project_2)
        await fast_session.commit()
>>>>>>> master

        resp = await client.get(f"allocations/user/{alice.address}/epoch/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {
            "allocations": [
<<<<<<< HEAD
                {"address": project_1, "amount": str(a_alloc_2.amount)},
                {"address": project_2, "amount": str(a_alloc_2.amount)},
=======
                {"address": project_1, "amount": str(alloc_1.amount)},
                {"address": project_2, "amount": str(alloc_2.amount)},
>>>>>>> master
            ],
            "isManuallyEdited": False,
        }

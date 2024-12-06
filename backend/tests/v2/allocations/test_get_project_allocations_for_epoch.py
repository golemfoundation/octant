import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories import FactoriesAggregator

"""Test cases for the GET /allocations/projects/{project_address}/epoch/{epoch_number} endpoint"""


@pytest.mark.asyncio
async def test_returns_empty_list_when_no_allocations(
    fast_client: AsyncClient, fast_session: AsyncSession
):
    """Should return an empty list when there are no allocations for the project in the epoch"""

    project_address = "0x433485B5951f250cEFDCbf197Cb0F60fdBE55513"

    async with fast_client as client:
        resp = await client.get(f"allocations/project/{project_address}/epoch/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == []


@pytest.mark.asyncio
async def test_returns_allocations_when_they_exist(
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    """Should return allocations when they exist"""

    # Given: allocations for a project
    project_address = "0x433485B5951f250cEFDCbf197Cb0F60fdBE55513"

    alice = await factories.users.get_or_create_alice()
    a_alloc1 = await factories.allocations.create(
        user=alice, epoch=1, project_address=project_address
    )
    a_alloc2 = await factories.allocations.create(
        user=alice, epoch=2, project_address=project_address
    )

    bob = await factories.users.get_or_create_bob()
    b_alloc1 = await factories.allocations.create(
        user=bob, epoch=1, project_address=project_address
    )

    async with fast_client as client:
        resp = await client.get(f"allocations/project/{project_address}/epoch/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == [
            {"amount": str(a_alloc1.amount), "address": alice.address},
            {"amount": str(b_alloc1.amount), "address": bob.address},
        ]

        # Allocations for epoch 2
        resp = await client.get(f"allocations/project/{project_address}/epoch/2")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == [
            {"amount": str(a_alloc2.amount), "address": alice.address},
        ]

        # No allocations for epoch 3
        resp = await client.get(f"allocations/project/{project_address}/epoch/3")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == []

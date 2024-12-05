import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories import FactoriesAggregator

"""Test cases for the GET /allocations/epoch/{epoch_number} endpoint"""


@pytest.mark.asyncio
async def test_returns_empty_list_when_no_allocations(
    fast_client: AsyncClient, fast_session: AsyncSession
):
    """Should return an empty list when there are no allocations for the epoch"""

    async with fast_client as client:
        resp = await client.get("allocations/epoch/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocations": []}


@pytest.mark.asyncio
async def test_returns_allocations_when_they_exist(
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    """Should return allocations when they exist"""

    # Given: donors with allocations
    alice = await factories.users.get_or_create_alice()
    a_alloc1 = await factories.allocations.create(user=alice, epoch=1)
    a_alloc2 = await factories.allocations.create(user=alice, epoch=2)
    a_alloc3 = await factories.allocations.create(user=alice, epoch=3)

    bob = await factories.users.get_or_create_bob()
    b_alloc1 = await factories.allocations.create(user=bob, epoch=1)
    b_alloc2 = await factories.allocations.create(user=bob, epoch=2)

    charlie = await factories.users.get_or_create_charlie()
    c_alloc1 = await factories.allocations.create(user=charlie, epoch=1)

    async with fast_client as client:
        # Allocations for epoch 1
        resp = await client.get("allocations/epoch/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {
            "allocations": [
                {
                    "donor": alice.address,
                    "amount": str(a_alloc1.amount),
                    "project": a_alloc1.project_address,
                },
                {
                    "donor": bob.address,
                    "amount": str(b_alloc1.amount),
                    "project": b_alloc1.project_address,
                },
                {
                    "donor": charlie.address,
                    "amount": str(c_alloc1.amount),
                    "project": c_alloc1.project_address,
                },
            ]
        }

        # Allocations for epoch 2
        resp = await client.get("allocations/epoch/2")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {
            "allocations": [
                {
                    "donor": alice.address,
                    "amount": str(a_alloc2.amount),
                    "project": a_alloc2.project_address,
                },
                {
                    "donor": bob.address,
                    "amount": str(b_alloc2.amount),
                    "project": b_alloc2.project_address,
                },
            ]
        }

        # Allocations for epoch 3
        resp = await client.get("allocations/epoch/3")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {
            "allocations": [
                {
                    "donor": alice.address,
                    "amount": str(a_alloc3.amount),
                    "project": a_alloc3.project_address,
                },
            ]
        }

        # No allocations for epoch 4
        resp = await client.get("allocations/epoch/4")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"allocations": []}


@pytest.mark.asyncio
async def test_returns_zero_allocations_when_include_zero_allocations_is_true(
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    """Should return zero allocations when include_zero_allocations is true"""

    # Given: a donor with allocations
    alice = await factories.users.get_or_create_alice()
    # For testing purposes, we set the amount to 0 of one of the allocations
    a_alloc1 = await factories.allocations.create(alice, epoch=1, amount=0)
    a_alloc2 = await factories.allocations.create(alice, epoch=1)  # This will have random amount

    async with fast_client as client:
        resp = await client.get(
            "allocations/epoch/1", params={"includeZeroAllocations": True}
        )
        assert resp.status_code == status.HTTP_200_OK

        allocations = resp.json()["allocations"]

        assert len(allocations) == 2

        assert {
            "donor": alice.address,
            "amount": "0",
            "project": a_alloc1.project_address,
        } in allocations
        assert {
            "donor": alice.address,
            "amount": str(a_alloc2.amount),
            "project": a_alloc2.project_address,
        } in allocations

        # Now check when include_zero_allocations is false
        resp = await client.get(
            "allocations/epoch/1", params={"includeZeroAllocations": False}
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {
            "allocations": [
                {
                    "donor": alice.address,
                    "amount": str(a_alloc2.amount),
                    "project": a_alloc2.project_address,
                },
            ]
        }

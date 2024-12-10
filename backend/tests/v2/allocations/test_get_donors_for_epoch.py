from datetime import datetime
<<<<<<< HEAD

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories import FactoriesAggregator
=======
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import status
from tests.v2.utils import FakeUser, FakeAllocation
>>>>>>> master

"""Test cases for the GET /allocations/donors/{epoch_number} (get_donors_for_epoch_v1) endpoint"""


@pytest.mark.asyncio
async def test_returns_empty_list_when_no_donors(
<<<<<<< HEAD
    fast_client: AsyncClient, fast_session: AsyncClient
=======
    fast_client: AsyncClient, fast_session: AsyncSession
>>>>>>> master
):
    """Should return an empty list when there are no donors for the epoch"""

    async with fast_client as client:
        # When: requesting donors for epoch 1
        resp = await client.get("allocations/donors/1")

        # Then: response should be successful with empty donors list
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"donors": []}


@pytest.mark.asyncio
async def test_returns_donors_when_they_exist(
<<<<<<< HEAD
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    """Should return a list of donors when they exist"""

    # Given: donors with allocations
    alice = await factories.users.get_or_create_alice()
    await factories.allocations.create(user=alice, epoch=1)
    await factories.allocations.create(user=alice, epoch=2)
    await factories.allocations.create(user=alice, epoch=3)

    bob = await factories.users.get_or_create_bob()
    await factories.allocations.create(user=bob, epoch=1)
    await factories.allocations.create(user=bob, epoch=2)

    charlie = await factories.users.get_or_create_charlie()
    await factories.allocations.create(user=charlie, epoch=1)
=======
    fast_client: AsyncClient, fast_session: AsyncSession
):
    """Should return a list of donors when they exist"""

    # Given: a donor
    alice = await FakeUser.GetAlice(fast_session)
    await FakeAllocation.of_(fast_session, alice, 1)
    await FakeAllocation.of_(fast_session, alice, 2)
    await FakeAllocation.of_(fast_session, alice, 3)

    bob = await FakeUser.GetBob(fast_session)
    await FakeAllocation.of_(fast_session, bob, 1)
    await FakeAllocation.of_(fast_session, bob, 2)

    charlie = await FakeUser.GetCharlie(fast_session)
    await FakeAllocation.of_(fast_session, charlie, 1)

    await fast_session.commit()
>>>>>>> master

    async with fast_client as client:
        # A, B, C are donors for epoch 1
        resp = await client.get("allocations/donors/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"donors": [alice.address, bob.address, charlie.address]}

        # A, B are donors for epoch 2
        resp = await client.get("allocations/donors/2")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"donors": [alice.address, bob.address]}

        # A is the only donor for epoch 3
        resp = await client.get("allocations/donors/3")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"donors": [alice.address]}

        # No donors for epoch 4
        resp = await client.get("allocations/donors/4")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"donors": []}


@pytest.mark.asyncio
async def test_returns_unique_donors(
<<<<<<< HEAD
    fast_client: AsyncClient, factories: FactoriesAggregator
=======
    fast_client: AsyncClient, fast_session: AsyncSession
>>>>>>> master
):
    """Should return unique donors"""

    # Given: a donor with allocation for 3 projects in the same epoch
<<<<<<< HEAD
    alice = await factories.users.get_or_create_alice()
    await factories.allocations.create(user=alice, epoch=1)
    await factories.allocations.create(user=alice, epoch=1)
    await factories.allocations.create(user=alice, epoch=1)
=======
    alice = await FakeUser.GetAlice(fast_session)
    await FakeAllocation.of_(fast_session, alice, 1)
    await FakeAllocation.of_(fast_session, alice, 1)
    await FakeAllocation.of_(fast_session, alice, 1)

    await fast_session.commit()
>>>>>>> master

    async with fast_client as client:
        resp = await client.get("allocations/donors/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"donors": [alice.address]}


@pytest.mark.asyncio
async def test_removed_allocations_are_not_included(
<<<<<<< HEAD
    fast_client: AsyncClient, fast_session: AsyncSession, factories: FactoriesAggregator
=======
    fast_client: AsyncClient, fast_session: AsyncSession
>>>>>>> master
):
    """Should not include removed allocations"""

    # Given: a donor with allocation for 3 projects in the same epoch
<<<<<<< HEAD
    alice = await factories.users.get_or_create_alice()
    alloc1 = await factories.allocations.create(user=alice, epoch=1)
    alloc2 = await factories.allocations.create(user=alice, epoch=1)
    alloc3 = await factories.allocations.create(user=alice, epoch=1)
=======
    alice = await FakeUser.GetAlice(fast_session)
    alloc1 = await FakeAllocation.of_(fast_session, alice, 1)
    alloc2 = await FakeAllocation.of_(fast_session, alice, 1)
    alloc3 = await FakeAllocation.of_(fast_session, alice, 1)

    await fast_session.commit()
>>>>>>> master

    async with fast_client as client:
        resp = await client.get("allocations/donors/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"donors": [alice.address]}

        # When: removing one of the allocations
        alloc1.deleted_at = datetime.now()
        alloc2.deleted_at = datetime.now()
        alloc3.deleted_at = datetime.now()

        await fast_session.commit()

        resp = await client.get("allocations/donors/1")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"donors": []}

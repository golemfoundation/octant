from datetime import datetime
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.modules.v2.utils import FakeAllocationRequest, FakeUser, FakeAllocation


class TestGetDonorsForEpochV1:
    """Test cases for the GET /allocations/donors/{epoch_id} (get_donors_for_epoch_v1) endpoint"""

    @pytest.mark.asyncio
    async def test_returns_empty_list_when_no_donors(
        self, fast_client: AsyncClient, fast_session: AsyncSession
    ):
        """Should return an empty list when there are no donors for the epoch"""

        async with fast_client as client:
            # When: requesting donors for epoch 1
            resp = await client.get("allocations/donors/1")

            # Then: response should be successful with empty donors list
            assert resp.status_code == 200
            assert resp.json() == {"donors": []}

    @pytest.mark.asyncio
    async def test_returns_donors_when_they_exist(
        self, fast_client: AsyncClient, fast_session: AsyncSession
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

        async with fast_client as client:
            # A, B, C are donors for epoch 1
            resp = await client.get("allocations/donors/1")
            assert resp.status_code == 200
            assert resp.json() == {
                "donors": [alice.address, bob.address, charlie.address]
            }

            # A, B are donors for epoch 2
            resp = await client.get("allocations/donors/2")
            assert resp.status_code == 200
            assert resp.json() == {"donors": [alice.address, bob.address]}

            # A is the only donor for epoch 3
            resp = await client.get("allocations/donors/3")
            assert resp.status_code == 200
            assert resp.json() == {"donors": [alice.address]}

            # No donors for epoch 4
            resp = await client.get("allocations/donors/4")
            assert resp.status_code == 200
            assert resp.json() == {"donors": []}

    @pytest.mark.asyncio
    async def test_returns_unique_donors(
        self, fast_client: AsyncClient, fast_session: AsyncSession
    ):
        """Should return unique donors"""

        # Given: a donor with allocation for 3 projects in the same epoch
        alice = await FakeUser.GetAlice(fast_session)
        await FakeAllocation.of_(fast_session, alice, 1)
        await FakeAllocation.of_(fast_session, alice, 1)
        await FakeAllocation.of_(fast_session, alice, 1)

        await fast_session.commit()

        async with fast_client as client:
            resp = await client.get("allocations/donors/1")
            assert resp.status_code == 200
            assert resp.json() == {"donors": [alice.address]}

    @pytest.mark.asyncio
    async def test_removed_allocations_are_not_included(
        self, fast_client: AsyncClient, fast_session: AsyncSession
    ):
        """Should not include removed allocations"""

        # Given: a donor with allocation for 3 projects in the same epoch
        alice = await FakeUser.GetAlice(fast_session)
        alloc1 = await FakeAllocation.of_(fast_session, alice, 1)
        alloc2 = await FakeAllocation.of_(fast_session, alice, 1)
        alloc3 = await FakeAllocation.of_(fast_session, alice, 1)

        await fast_session.commit()

        async with fast_client as client:
            resp = await client.get("allocations/donors/1")
            assert resp.status_code == 200
            assert resp.json() == {"donors": [alice.address]}

            # When: removing one of the allocations
            alloc1.deleted_at = datetime.now()
            alloc2.deleted_at = datetime.now()
            alloc3.deleted_at = datetime.now()

            await fast_session.commit()

            resp = await client.get("allocations/donors/1")
            assert resp.status_code == 200
            assert resp.json() == {"donors": []}


class TestGetAllocationsForEpochV1:
    """Test cases for the GET /allocations/epoch/{epoch_id} endpoint"""

    @pytest.mark.asyncio
    async def test_returns_empty_list_when_no_allocations(
        self, fast_client: AsyncClient, fast_session: AsyncSession
    ):
        """Should return an empty list when there are no allocations for the epoch"""

        async with fast_client as client:
            resp = await client.get("allocations/epoch/1")
            assert resp.status_code == 200
            assert resp.json() == {"allocations": []}

    @pytest.mark.asyncio
    async def test_returns_allocations_when_they_exist(
        self, fast_client: AsyncClient, fast_session: AsyncSession
    ):
        """Should return allocations when they exist"""

        # Given: donors with allocations
        alice = await FakeUser.GetAlice(fast_session)
        a_alloc1 = await FakeAllocation.of_(fast_session, alice, 1)
        a_alloc2 = await FakeAllocation.of_(fast_session, alice, 2)
        a_alloc3 = await FakeAllocation.of_(fast_session, alice, 3)

        bob = await FakeUser.GetBob(fast_session)
        b_alloc1 = await FakeAllocation.of_(fast_session, bob, 1)
        b_alloc2 = await FakeAllocation.of_(fast_session, bob, 2)

        charlie = await FakeUser.GetCharlie(fast_session)
        c_alloc1 = await FakeAllocation.of_(fast_session, charlie, 1)

        await fast_session.commit()

        async with fast_client as client:
            # Allocations for epoch 1
            resp = await client.get("allocations/epoch/1")
            assert resp.status_code == 200
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
            assert resp.status_code == 200
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
            assert resp.status_code == 200
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
            assert resp.status_code == 200
            assert resp.json() == {"allocations": []}

    @pytest.mark.asyncio
    async def test_returns_zero_allocations_when_include_zero_allocations_is_true(
        self, fast_client: AsyncClient, fast_session: AsyncSession
    ):
        """Should return zero allocations when include_zero_allocations is true"""

        # Given: a donor with allocations
        alice = await FakeUser.GetAlice(fast_session)
        # For testing purposes, we set the amount to 0 of one of the allocations
        a_alloc1 = await FakeAllocation.of_(fast_session, alice, 1, amount=0)
        a_alloc2 = await FakeAllocation.of_(
            fast_session, alice, 1
        )  # This will have random amount

        await fast_session.commit()

        async with fast_client as client:
            resp = await client.get(
                "allocations/epoch/1", params={"includeZeroAllocations": True}
            )
            assert resp.status_code == 200

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
            assert resp.status_code == 200
            assert resp.json() == {
                "allocations": [
                    {
                        "donor": alice.address,
                        "amount": str(a_alloc2.amount),
                        "project": a_alloc2.project_address,
                    },
                ]
            }


class TestGetProjectAllocationsForEpochV1:
    """Test cases for the GET /allocations/projects/{project_id}/epoch/{epoch_id} endpoint"""

    @pytest.mark.asyncio
    async def test_returns_empty_list_when_no_allocations(
        self, fast_client: AsyncClient, fast_session: AsyncSession
    ):
        """Should return an empty list when there are no allocations for the project in the epoch"""

        project_address = "0x433485B5951f250cEFDCbf197Cb0F60fdBE55513"

        async with fast_client as client:
            resp = await client.get(f"allocations/projects/{project_address}/epoch/1")
            assert resp.status_code == 200
            assert resp.json() == []

    @pytest.mark.asyncio
    async def test_returns_allocations_when_they_exist(
        self, fast_client: AsyncClient, fast_session: AsyncSession
    ):
        """Should return allocations when they exist"""

        # Given: allocations for a project
        project_address = "0x433485B5951f250cEFDCbf197Cb0F60fdBE55513"
        alice = await FakeUser.GetAlice(fast_session)
        a_alloc1 = await FakeAllocation.of_(fast_session, alice, 1, project_address)
        a_alloc2 = await FakeAllocation.of_(fast_session, alice, 2, project_address)

        bob = await FakeUser.GetBob(fast_session)
        b_alloc1 = await FakeAllocation.of_(fast_session, bob, 1, project_address)

        await fast_session.commit()

        async with fast_client as client:
            resp = await client.get(f"allocations/projects/{project_address}/epoch/1")
            assert resp.status_code == 200
            assert resp.json() == [
                {"amount": str(a_alloc1.amount), "address": alice.address},
                {"amount": str(b_alloc1.amount), "address": bob.address},
            ]

            # Allocations for epoch 2
            resp = await client.get(f"allocations/projects/{project_address}/epoch/2")
            assert resp.status_code == 200
            assert resp.json() == [
                {"amount": str(a_alloc2.amount), "address": alice.address},
            ]

            # No allocations for epoch 3
            resp = await client.get(f"allocations/projects/{project_address}/epoch/3")
            assert resp.status_code == 200
            assert resp.json() == []


class TestGetUserAllocationsForEpochV1:
    """Test cases for the GET /allocations/users/{user_id}/epoch/{epoch_id} (get_user_allocations_for_epoch_v1)endpoint"""

    @pytest.mark.asyncio
    async def test_returns_empty_list_when_no_allocations(
        self, fast_client: AsyncClient, fast_session: AsyncSession
    ):
        """Should return an empty list when there are no allocations for the user in the epoch"""

        alice = await FakeUser.GetAlice(fast_session)

        async with fast_client as client:
            resp = await client.get(f"allocations/user/{alice.address}/epoch/1")
            assert resp.status_code == 200
            assert resp.json() == {"allocations": [], "isManuallyEdited": None}

    @pytest.mark.asyncio
    async def test_returns_allocations_when_they_exist(
        self, fast_client: AsyncClient, fast_session: AsyncSession
    ):
        """Should return allocations when they exist"""

        # Given: allocations for a user
        alice = await FakeUser.GetAlice(fast_session)
        # First epoch
        a_alloc1 = await FakeAllocation.of_(fast_session, alice, 1)
        a_alloc2 = await FakeAllocation.of_(fast_session, alice, 1)
        a_alloc3 = await FakeAllocation.of_(fast_session, alice, 1)
        await FakeAllocationRequest.create(fast_session, alice, 1, 0, "", False)

        # Second epoch
        a_alloc4 = await FakeAllocation.of_(fast_session, alice, 2)
        a_alloc5 = await FakeAllocation.of_(fast_session, alice, 2)
        await FakeAllocationRequest.create(fast_session, alice, 2, 1, "", True)

        # Third epoch
        a_alloc6 = await FakeAllocation.of_(fast_session, alice, 3)
        await FakeAllocationRequest.create(fast_session, alice, 3, 2, "", False)

        await fast_session.commit()

        async with fast_client as client:
            resp = await client.get(f"allocations/user/{alice.address}/epoch/1")
            assert resp.status_code == 200
            assert resp.json() == {
                "allocations": [
                    {
                        "amount": str(a_alloc1.amount),
                        "address": a_alloc1.project_address,
                    },
                    {
                        "amount": str(a_alloc2.amount),
                        "address": a_alloc2.project_address,
                    },
                    {
                        "amount": str(a_alloc3.amount),
                        "address": a_alloc3.project_address,
                    },
                ],
                "isManuallyEdited": False,
            }

            resp = await client.get(f"allocations/user/{alice.address}/epoch/2")
            assert resp.status_code == 200
            assert resp.json() == {
                "allocations": [
                    {
                        "amount": str(a_alloc4.amount),
                        "address": a_alloc4.project_address,
                    },
                    {
                        "amount": str(a_alloc5.amount),
                        "address": a_alloc5.project_address,
                    },
                ],
                "isManuallyEdited": True,
            }

            resp = await client.get(f"allocations/user/{alice.address}/epoch/3")
            assert resp.status_code == 200
            assert resp.json() == {
                "allocations": [
                    {
                        "amount": str(a_alloc6.amount),
                        "address": a_alloc6.project_address,
                    },
                ],
                "isManuallyEdited": False,
            }


class TestGetUserNextAllocationNonceV1:
    """Test cases for the GET /allocations/users/{user_id}/allocation_nonce endpoint"""

    @pytest.mark.asyncio
    async def test_returns_nonce_when_no_allocations_exist(
        self, fast_client: AsyncClient, fast_session: AsyncSession
    ):
        """Should return the nonce when it exists"""

        alice = await FakeUser.GetAlice(fast_session)

        async with fast_client as client:
            resp = await client.get(
                f"allocations/users/{alice.address}/allocation_nonce"
            )
            assert resp.status_code == 200
            assert resp.json() == {"allocationNonce": 0}

    @pytest.mark.asyncio
    async def test_returns_nonce_when_allocations_exist(
        self, fast_client: AsyncClient, fast_session: AsyncSession
    ):
        """Should return the nonce when allocation requests exist"""

        alice = await FakeUser.GetAlice(fast_session)

        async with fast_client as client:
            resp = await client.get(
                f"allocations/users/{alice.address}/allocation_nonce"
            )
            assert resp.status_code == 200
            assert resp.json() == {"allocationNonce": 0}

            await FakeAllocationRequest.create(fast_session, alice, 1, 0, "", False)
            await fast_session.commit()

            resp = await client.get(
                f"allocations/users/{alice.address}/allocation_nonce"
            )
            assert resp.status_code == 200
            assert resp.json() == {"allocationNonce": 1}

            await FakeAllocationRequest.create(fast_session, alice, 1, 1, "", False)
            await fast_session.commit()

            resp = await client.get(
                f"allocations/users/{alice.address}/allocation_nonce"
            )
            assert resp.status_code == 200
            assert resp.json() == {"allocationNonce": 2}

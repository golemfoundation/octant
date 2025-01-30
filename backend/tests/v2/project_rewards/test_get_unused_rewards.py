import pytest
from http import HTTPStatus
from datetime import datetime, timezone
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories import FactoriesAggregator
from tests.v2.fake_subgraphs.conftest import FakeEpochsSubgraphCallable
from tests.v2.fake_subgraphs.helpers import FakeEpochEventDetails


@pytest.mark.asyncio
async def test_returns_empty_when_no_budgets(
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return empty list and zero value when there are no budgets"""
    # Given: an epoch with no budgets
    epoch_number = 1

    # Mock subgraph response
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=epoch_number,
            )
        ]
    )

    async with fast_client as client:
        resp = await client.get(f"rewards/unused/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "addresses": [],
            "value": "0",
        }


@pytest.mark.asyncio
async def test_returns_unused_budgets_excluding_donors_and_patrons(
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return budgets excluding donors and patrons"""
    # Given: an epoch with various users
    epoch_number = 1

    # Mock subgraph response
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=epoch_number,
            )
        ]
    )

    # Create users with different roles
    alice = await factories.users.get_or_create_alice()  # Will be a donor
    bob = await factories.users.get_or_create_bob()  # Will be a patron
    charlie = await factories.users.get_or_create_charlie()  # Will have unused budget
    dave = await factories.users.create()  # Will have unused budget

    # Create budgets for all users
    await factories.budgets.create(user=alice, epoch=epoch_number, amount=100)
    await factories.budgets.create(user=bob, epoch=epoch_number, amount=200)
    charlie_budget = await factories.budgets.create(
        user=charlie, epoch=epoch_number, amount=300
    )
    dave_budget = await factories.budgets.create(
        user=dave, epoch=epoch_number, amount=400
    )

    # Make Alice a donor by creating an allocation
    await factories.allocations.create(user=alice, epoch=epoch_number)

    # Make Bob a patron
    await factories.patrons.create(
        user=bob,
        patron_mode_enabled=True,
        created_at=datetime.fromtimestamp(1500, timezone.utc),
    )

    async with fast_client as client:
        resp = await client.get(f"rewards/unused/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK

        result = resp.json()
        assert sorted(result["addresses"]) == sorted([charlie.address, dave.address])
        assert result["value"] == str(
            int(charlie_budget.budget) + int(dave_budget.budget)
        )


@pytest.mark.asyncio
async def test_returns_empty_when_all_users_are_donors_or_patrons(
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return empty when all users with budgets are either donors or patrons"""
    # Given: an epoch where all users are donors or patrons
    epoch_number = 1

    # Mock subgraph response
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=epoch_number,
            )
        ]
    )

    # Create users
    alice = await factories.users.get_or_create_alice()  # Will be a donor
    bob = await factories.users.get_or_create_bob()  # Will be a patron

    # Create budgets
    await factories.budgets.create(user=alice, epoch=epoch_number)
    await factories.budgets.create(user=bob, epoch=epoch_number)

    # Make Alice a donor
    await factories.allocations.create(user=alice, epoch=epoch_number)

    # Make Bob a patron
    await factories.patrons.create(
        user=bob,
        patron_mode_enabled=True,
        created_at=datetime.fromtimestamp(1500, timezone.utc),
    )

    async with fast_client as client:
        resp = await client.get(f"rewards/unused/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "addresses": [],
            "value": "0",
        }

from http import HTTPStatus
import pytest
from datetime import datetime, timezone
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories import FactoriesAggregator
from tests.v2.fake_subgraphs.conftest import FakeEpochsSubgraphCallable
from tests.v2.fake_subgraphs.helpers import FakeEpochEventDetails


@pytest.mark.asyncio
async def test_get_patrons_for_epoch_happy_path(
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return all users who toggled patron mode and have a positive budget"""

    # Mock data
    epoch_number = 1
    end_timestamp = datetime.fromtimestamp(2000, timezone.utc)
    decision_window = 1000

    # Setup fake subgraph
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=epoch_number,
                to_ts=end_timestamp.timestamp(),
                decision_window=decision_window,
            )
        ]
    )

    # Create users with different roles
    alice = (
        await factories.users.get_or_create_alice()
    )  # Will be a patron with 0 budget
    bob = await factories.users.get_or_create_bob()  # Will be a patron with 200 budget
    charlie = await factories.users.get_or_create_charlie()  # Will be default user

    # Create budgets for all users
    await factories.budgets.create(user=alice, epoch=epoch_number, amount=0)
    await factories.budgets.create(user=bob, epoch=epoch_number, amount=200)
    await factories.budgets.create(user=charlie, epoch=epoch_number, amount=300)

    # Make Alice & Bob a patron
    await factories.patrons.create(
        user=alice,
        patron_mode_enabled=True,
        created_at=datetime.fromtimestamp(1500, timezone.utc),
    )
    await factories.patrons.create(
        user=bob,
        patron_mode_enabled=True,
        created_at=datetime.fromtimestamp(1500, timezone.utc),
    )

    async with fast_client as client:
        resp = await client.get(f"user/patrons/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK

        # We should not see alice in the list because she has no budget
        assert resp.json() == {"patrons": [bob.address]}


@pytest.mark.asyncio
async def test_returns_empty_list_when_no_patrons(
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    # Mock data
    epoch_number = 1
    end_timestamp = datetime.fromtimestamp(2000, timezone.utc)
    decision_window = 1000

    # Setup fake subgraph
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=epoch_number,
                to_ts=end_timestamp.timestamp(),
                decision_window=decision_window,
            )
        ]
    )

    # Create users with different roles
    alice = await factories.users.get_or_create_alice()  # Will be a patron

    # Create budgets for all users
    await factories.budgets.create(user=alice, epoch=epoch_number, amount=100)

    # Toggle patron mode for alice on and off
    await factories.patrons.create(
        user=alice,
        patron_mode_enabled=True,
        created_at=datetime.fromtimestamp(1000, timezone.utc),
    )
    await factories.patrons.create(
        user=alice,
        patron_mode_enabled=False,
        created_at=datetime.fromtimestamp(1500, timezone.utc),
    )

    async with fast_client as client:
        resp = await client.get(f"user/patrons/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK

        # We should not see alice in the list because she disabled patron mode
        assert resp.json() == {"patrons": []}

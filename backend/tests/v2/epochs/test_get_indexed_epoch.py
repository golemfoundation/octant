from http import HTTPStatus

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.fake_contracts.conftest import FakeEpochsContractCallable
from tests.v2.fake_contracts.helpers import FakeEpochsContractDetails
from tests.v2.fake_subgraphs.conftest import FakeEpochsSubgraphCallable
from tests.v2.fake_subgraphs.helpers import FakeEpochEventDetails


@pytest.mark.asyncio
async def test_returns_correct_indexed_epoch_for_a_single_epoch(
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
):
    mocked_current_epoch = 1

    fake_epochs_contract_factory(
        FakeEpochsContractDetails(current_epoch=mocked_current_epoch)
    )
    fake_epochs_subgraph_factory([FakeEpochEventDetails(epoch=1)])

    async with fast_client as client:
        resp = await client.get("epochs/indexed")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "currentEpoch": mocked_current_epoch,
            "indexedEpoch": mocked_current_epoch,
        }


@pytest.mark.asyncio
async def test_returns_correct_indexed_epoch_for_multiple_epochs(
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
):
    mocked_current_epoch = 2

    fake_epochs_contract_factory(
        FakeEpochsContractDetails(current_epoch=mocked_current_epoch)
    )
    fake_epochs_subgraph_factory(
        [FakeEpochEventDetails(epoch=1), FakeEpochEventDetails(epoch=2)]
    )

    async with fast_client as client:
        resp = await client.get("epochs/indexed")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "currentEpoch": mocked_current_epoch,
            "indexedEpoch": mocked_current_epoch,
        }


@pytest.mark.asyncio
async def test_returns_divergent_epochs_when_not_indexed(
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
):
    mocked_current_epoch = 2

    fake_epochs_contract_factory(
        FakeEpochsContractDetails(current_epoch=mocked_current_epoch)
    )
    fake_epochs_subgraph_factory(
        [FakeEpochEventDetails(epoch=1)]
    )  # subgraph has only epoch 1 thus not indexed

    async with fast_client as client:
        resp = await client.get("epochs/indexed")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "currentEpoch": mocked_current_epoch,
            "indexedEpoch": 1,
        }

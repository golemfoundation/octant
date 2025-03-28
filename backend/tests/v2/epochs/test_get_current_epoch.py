from http import HTTPStatus

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.fake_contracts.helpers import FakeEpochsContractDetails
from tests.v2.fake_contracts.conftest import FakeEpochsContractCallable


@pytest.mark.asyncio
async def test_returns_correct_current_epoch(
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
):
    mocked_current_epoch = 1

    fake_epochs_contract_factory(
        FakeEpochsContractDetails(current_epoch=mocked_current_epoch)
    )

    async with fast_client as client:
        resp = await client.get("epochs/current")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"currentEpoch": mocked_current_epoch}

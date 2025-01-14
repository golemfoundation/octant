from http import HTTPStatus

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories import FactoriesAggregator
from tests.v2.factories.helpers import generate_random_eip55_address
from tests.v2.fake_contracts.conftest import FakeProjectsContractCallable
from tests.v2.fake_contracts.helpers import (
    FakeProjectsContractDetails,
    FakeProjectDetails,
)


@pytest.mark.asyncio
async def test_returns_correct_projects_metadata_for_epoch(
    fake_projects_contract_factory: FakeProjectsContractCallable,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
):
    epoch_number = 3
    projects_cid = "Qm123456789abcdef"
    project_details = [
        FakeProjectDetails(
            address=generate_random_eip55_address(), epoch_number=epoch_number
        )
    ]

    fake_projects_contract_details = FakeProjectsContractDetails(
        projects_cid=projects_cid, projects_details=project_details
    )

    fake_projects_contract_factory(fake_projects_contract_details)

    async with fast_client as client:
        resp = await client.get(f"projects/epoch/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "projectsAddresses": [project_details[0].address],
            "projectsCid": projects_cid,
        }


@pytest.mark.asyncio
async def test_returns_multiple_projects_metadata_for_epoch(
    fake_projects_contract_factory: FakeProjectsContractCallable,
    fast_client: AsyncClient,
    factories: FactoriesAggregator,
):
    epoch_number = 3
    projects_cid = "Qm123456789abcdef"
    project_details = [
        FakeProjectDetails(
            address=generate_random_eip55_address(), epoch_number=epoch_number
        )
        for _ in range(3)
    ]

    fake_projects_contract_details = FakeProjectsContractDetails(
        projects_cid=projects_cid, projects_details=project_details
    )

    fake_projects_contract_factory(fake_projects_contract_details)

    async with fast_client as client:
        resp = await client.get(f"projects/epoch/{epoch_number}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "projectsAddresses": [detail.address for detail in project_details],
            "projectsCid": projects_cid,
        }


@pytest.mark.asyncio
async def test_returns_empty_list_of_projects_addresses_for_nonexistent_epoch(
    fake_projects_contract_factory: FakeProjectsContractCallable,
    fast_client: AsyncClient,
    factories: FactoriesAggregator,
):
    epoch_number = 3
    non_existent_epoch = 4

    projects_cid = "Qm123456789abcdef"
    fake_projects_contract_details = FakeProjectsContractDetails(
        projects_cid=projects_cid,
        projects_details=[
            FakeProjectDetails(
                address=generate_random_eip55_address(), epoch_number=epoch_number
            )
        ],
    )

    fake_projects_contract_factory(fake_projects_contract_details)

    async with fast_client as client:
        resp = await client.get(f"projects/epoch/{non_existent_epoch}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"projectsAddresses": [], "projectsCid": projects_cid}

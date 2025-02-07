from http import HTTPStatus

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories import FactoriesAggregator
from tests.v2.factories.helpers import generate_random_eip55_address


@pytest.mark.asyncio
async def test_returns_empty_project_details(
    fast_client: AsyncClient, fast_session: AsyncSession
):
    async with fast_client as client:
        resp = await client.get("projects/details?epochs=1&searchPhrases=test")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"projectsDetails": []}


@pytest.mark.asyncio
async def test_returns_correct_project_details_for_single_filter(
    fast_client: AsyncClient, factories: FactoriesAggregator
):
    single_details = {
        "name": "test_project1",
        "epoch": 3,
        "address": generate_random_eip55_address(),
    }

    await factories.projects_details.create(**single_details)

    async with fast_client as client:
        resp = await client.get("projects/details?epochs=3&searchPhrases=test_project")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "projectsDetails": [
                {
                    "name": single_details["name"],
                    "epoch": str(single_details["epoch"]),
                    "address": single_details["address"],
                }
            ]
        }


@pytest.mark.asyncio
async def test_returns_correct_project_details_for_many_epochs(
    fast_client: AsyncClient,
    factories: FactoriesAggregator,
    multiple_project_details_simple: list,
):
    details = multiple_project_details_simple

    for detail in details:
        await factories.projects_details.create(**detail)

    async with fast_client as client:
        resp = await client.get("projects/details?epochs=1,2,3&searchPhrases=test")
        assert resp.status_code == HTTPStatus.OK

        assert resp.json() == {
            "projectsDetails": [
                {
                    "name": details[2]["name"],
                    "epoch": str(details[2]["epoch"]),
                    "address": details[2]["address"],
                },
                {
                    "name": details[1]["name"],
                    "epoch": str(details[1]["epoch"]),
                    "address": details[1]["address"],
                },
                {
                    "name": details[0]["name"],
                    "epoch": str(details[0]["epoch"]),
                    "address": details[0]["address"],
                },
            ]
        }


@pytest.mark.asyncio
async def test_returns_correct_project_details_for_many_epochs_and_search_phrases(
    fast_client: AsyncClient,
    factories: FactoriesAggregator,
    multiple_project_details_various: list,
):
    details = multiple_project_details_various

    for detail in details:
        await factories.projects_details.create(**detail)

    async with fast_client as client:
        resp = await client.get(
            "projects/details?epochs=1,2,3&searchPhrases=test,octant,great"
        )
        assert resp.status_code == HTTPStatus.OK

        assert resp.json() == {
            "projectsDetails": [
                {
                    "name": details[2]["name"],
                    "epoch": str(details[2]["epoch"]),
                    "address": details[2]["address"],
                },
                {
                    "name": details[1]["name"],
                    "epoch": str(details[1]["epoch"]),
                    "address": details[1]["address"],
                },
                {
                    "name": details[0]["name"],
                    "epoch": str(details[0]["epoch"]),
                    "address": details[0]["address"],
                },
            ]
        }


@pytest.mark.asyncio
async def test_returns_not_duplicated_project_details_for_words_from_the_same_project(
    fast_client: AsyncClient,
    factories: FactoriesAggregator,
    multiple_project_details_various: list,
):
    details = multiple_project_details_various
    words = "test,project1"

    for detail in details:
        await factories.projects_details.create(**detail)

    async with fast_client as client:
        resp = await client.get(f"projects/details?epochs=3&searchPhrases={words}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "projectsDetails": [
                {
                    "name": details[0]["name"],
                    "epoch": str(details[0]["epoch"]),
                    "address": details[0]["address"],
                }
            ]
        }

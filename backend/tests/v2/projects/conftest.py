import pytest

from tests.v2.fake_contracts.conftest import fake_projects_contract_factory  # noqa: F401

from tests.v2.factories.helpers import generate_random_eip55_address


@pytest.fixture(scope="module")
def multiple_project_details_simple() -> list:
    details = [
        {
            "name": "test_project1",
            "epoch": 3,
            "address": generate_random_eip55_address(),
        },
        {
            "name": "test_project2",
            "epoch": 2,
            "address": generate_random_eip55_address(),
        },
        {
            "name": "test_project3",
            "epoch": 1,
            "address": generate_random_eip55_address(),
        },
    ]

    return details


@pytest.fixture(scope="module")
def multiple_project_details_various() -> list:
    details = [
        {
            "name": "test_project1",
            "epoch": 3,
            "address": generate_random_eip55_address(),
        },
        {
            "name": "octant_project2",
            "epoch": 2,
            "address": generate_random_eip55_address(),
        },
        {
            "name": "great_project3",
            "epoch": 1,
            "address": generate_random_eip55_address(),
        },
    ]
    return details

import pytest

from app.modules.dto import AllocationDTO


@pytest.fixture
def data_for_quadratic_funding(projects):
    """
    This fixture is used to create a list of allocations for the quadratic funding algorithm.

    Data is got from Octant's Excel file: https://docs.google.com/spreadsheets/d/1GpZ5ZIJX8nYh7xLw9P9lIoXIVAxiMgda89sN3iYFFiI/edit#gid=0
    """

    allocations = [
        *[AllocationDTO(projects[0], amount) for amount in range(100, 600, 100)],
        *[AllocationDTO(projects[1], amount) for amount in range(5, 100, 5)],
        AllocationDTO(projects[2], 50),
        AllocationDTO(projects[2], 100),
        AllocationDTO(projects[2], 200),
    ]

    matched_rewards = 35000

    return allocations, matched_rewards

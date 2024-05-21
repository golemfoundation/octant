from decimal import Decimal

from app.engine.projects.rewards.allocations import ProjectAllocationsPayload
from app.engine.projects.rewards.allocations.quadratic_funding import (
    QuadraticFundingAllocations,
)


def test_quadratic_funding_grouping(projects, data_for_quadratic_funding):
    allocations, _ = data_for_quadratic_funding

    payload = ProjectAllocationsPayload(allocations=allocations)

    (
        result_allocations,
        total_allocated,
    ) = QuadraticFundingAllocations().group_allocations_by_projects(payload)

    assert total_allocated == Decimal("24356.29135849481011578840500")

    assert len(result_allocations) == 3
    assert (
        projects[0],
        Decimal("7026.349558296852634537697422"),
    ) in result_allocations
    assert (
        projects[1],
        Decimal("16355.67773148602891767038366"),
    ) in result_allocations
    assert (
        projects[2],
        Decimal("974.2640687119285635803239250"),
    ) in result_allocations

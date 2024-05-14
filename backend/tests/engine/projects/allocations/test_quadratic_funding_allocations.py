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

    assert total_allocated == Decimal("24356.29135849480940123612527")

    assert len(result_allocations) == 3
    assert (
        projects[0],
        Decimal("7026.3495582968544113100506365299224853515625"),
    ) in result_allocations
    assert (
        projects[1],
        Decimal("16355.67773148602645960636436939239501953125"),
    ) in result_allocations
    assert (
        projects[2],
        Decimal("974.264068711928530319710262119770050048828125"),
    ) in result_allocations

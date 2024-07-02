from decimal import Decimal

from app.engine.projects.rewards.allocations import (
    ProjectAllocationsPayload,
)
from app.engine.projects.rewards.allocations.quadratic_funding import (
    QuadraticFundingAllocations,
)


def test_quadratic_funding_grouping(projects, data_for_qf_max_uq_score):
    allocations, _ = data_for_qf_max_uq_score

    payload = ProjectAllocationsPayload(allocations=allocations)

    (
        grouped_allocations,
        result_allocations,
        total_allocated,
    ) = QuadraticFundingAllocations().group_allocations_by_projects(payload)

    grouped_allocations_keys = list(grouped_allocations.keys())

    assert len(grouped_allocations) == 3

    assert grouped_allocations_keys[0] == projects[1]
    assert grouped_allocations_keys[1] == projects[0]
    assert grouped_allocations_keys[2] == projects[2]

    assert total_allocated == Decimal("24356.29135849481011578840500")

    assert len(result_allocations) == 3
    assert result_allocations[0].project_address == projects[1] and result_allocations[
        0
    ].amount == Decimal("16355.67773148602891767038366")
    assert result_allocations[1].project_address == projects[0] and result_allocations[
        1
    ].amount == Decimal("7026.349558296852634537697422")
    assert result_allocations[2].project_address == projects[2] and result_allocations[
        2
    ].amount == Decimal("974.2640687119285635803239250")

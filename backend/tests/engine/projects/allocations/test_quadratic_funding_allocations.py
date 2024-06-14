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
        result_allocations,
        total_allocated,
    ) = QuadraticFundingAllocations().group_allocations_by_projects(payload)

    assert total_allocated == 24355

    assert len(result_allocations) == 3
    assert (
        result_allocations[0].project_address == projects[1]
        and result_allocations[0].amount == 16355
    )
    assert (
        result_allocations[1].project_address == projects[0]
        and result_allocations[1].amount == 7026
    )
    assert (
        result_allocations[2].project_address == projects[2]
        and result_allocations[2].amount == 974
    )

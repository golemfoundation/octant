from app.engine.projects.rewards.allocations import (
    ProjectAllocations,
)


class DefaultProjectAllocations(ProjectAllocations):
    def _sum_allocations(self, allocations):
        return sum([int(allocation.amount) for allocation in allocations])

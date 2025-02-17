from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories.uniqueness_quotients import UniquenessQuotientFactorySet
from tests.v2.factories.allocation_requests import AllocationRequestFactorySet
from tests.v2.factories.allocations import AllocationFactorySet
from tests.v2.factories.projects_details import ProjectsDetailsFactorySet
from tests.v2.factories.users import UserFactorySet
from tests.v2.factories.budgets import BudgetFactorySet
from tests.v2.factories.pending_snapshots import PendingEpochSnapshotFactorySet
from tests.v2.factories.finalized_snapshots import FinalizedEpochSnapshotFactorySet
from tests.v2.factories.patrons import PatronModeEventFactorySet
from dataclasses import dataclass


@dataclass
class FactoriesAggregator:
    """
    Class for aggregating sets of Factory Boy factories into a single interface.


    This class provides a way to aggregate multiple sets of Factory Boy factories
    into a single interface for convenient access during testing. Each factory set is
    associated with a specific domain or entity, and this class allows you to access
    and initialize those factory sets with a common database session.
    """

    users: UserFactorySet
    allocation_requests: AllocationRequestFactorySet
    allocations: AllocationFactorySet
    projects_details: ProjectsDetailsFactorySet
    budgets: BudgetFactorySet
    pending_snapshots: PendingEpochSnapshotFactorySet
    finalized_snapshots: FinalizedEpochSnapshotFactorySet
    patrons: PatronModeEventFactorySet
    uniqueness_quotients: UniquenessQuotientFactorySet

    def __init__(self, fast_session: AsyncSession):
        """
        Initialize the FactoriesAggregator instance.
        """
        self.users = UserFactorySet(fast_session)
        self.allocation_requests = AllocationRequestFactorySet(fast_session)
        self.allocations = AllocationFactorySet(fast_session)
        self.projects_details = ProjectsDetailsFactorySet(fast_session)
        self.budgets = BudgetFactorySet(fast_session)
        self.pending_snapshots = PendingEpochSnapshotFactorySet(fast_session)
        self.finalized_snapshots = FinalizedEpochSnapshotFactorySet(fast_session)
        self.patrons = PatronModeEventFactorySet(fast_session)
        self.uniqueness_quotients = UniquenessQuotientFactorySet(fast_session)

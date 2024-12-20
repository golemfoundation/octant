from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories.allocation_requests import AllocationRequestFactorySet
from tests.v2.factories.allocations import AllocationFactorySet
from tests.v2.factories.users import UserFactorySet
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

    def __init__(self, fast_session: AsyncSession):
        """
        Initialize the FactoriesAggregator instance.
        """
        self.users = UserFactorySet(fast_session)
        self.allocation_requests = AllocationRequestFactorySet(fast_session)
        self.allocations = AllocationFactorySet(fast_session)

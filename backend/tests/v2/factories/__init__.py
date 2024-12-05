from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories.allocation_requests import AllocationRequestFactorySet
from tests.v2.factories.allocations import AllocationFactorySet
from tests.v2.factories.users import UserFactorySet


class FactoriesAggregator:
    """
    Class for aggregating sets of Factory Boy factories into a single interface.


    This class provides a way to aggregate multiple sets of Factory Boy factories
    into a single interface for convenient access during testing. Each factory set is
    associated with a specific domain or entity, and this class allows you to access
    and initialize those factory sets with a common database session.


    Parameters:
    - test_db: An SQLAlchemy session to be shared among the aggregated factory sets.


    Attributes:
    - _factory_sets (dict): A dictionary mapping attribute names to Factory Boy factory set classes. Each factory set class should inherit from FactorySetBase.


    Example:
    - class MyFactoriesAggregator(FactoriesAggregator):
            _factory_sets = {
                'client': ClientFactorySet,
                'workflow': WorkflowFactorySet,
            }


        # Usage:
        factories = MyFactoriesAggregator(test_db)
        client = factories.client.client_factory.create()
        workflow = factories.workflow.workflow_factory.create()


    Note:
        This class is designed to simplify the management and access of multiple sets of
        Factory Boy factories in a testing environment.
    """

    _factory_sets = {
        "users": UserFactorySet,
        "allocation_requests": AllocationRequestFactorySet,
        "allocations": AllocationFactorySet,
    }

    def __init__(self, fast_session: AsyncSession):
        """
        Initialize the FactoriesAggregator instance.


        Associates the provided SQLAlchemy session with the
        specified factory sets, making them available as attributes of the instance.


        Args:
            fast_session: An SQLAlchemy session to be shared among
                     the aggregated factory sets.
        """
        for attr_name, factory_set in self._factory_sets.items():
            setattr(self, attr_name, factory_set(fast_session))

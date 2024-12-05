from sqlalchemy.ext.asyncio import AsyncSession


class FactorySetBase:
    """
    Base class for managing sets of Factory Boy factories with SQLAlchemy sessions.


    This class provides a base for managing sets of Factory Boy factories within a testing
    environment where SQLAlchemy sessions are used. It allows you to associate SQLAlchemy
    sessions (typically a test database session) with Factory Boy factories for use in
    creating and persisting objects during tests.


    Args:
        fast_session: An SQLAlchemy session or database connection to associate with the factories.


    Attributes:
        _factories (dict): A dictionary mapping attribute names to Factory Boy factory classes.
            Subclasses should define this dictionary to specify the factories to be managed.


    Example:
        class MyFactorySet(FactorySetBase):
            _factories = {
                'user_factory': UserFactory,
                'post_factory': PostFactory,
            }


        # Usage:
        factory_set = MyFactorySet(fast_session)
        user = factory_set.user_factory.create()
        post = factory_set.post_factory.create()


    Note:
        This class is intended for use in testing environments and provides a convenient way
        to manage and access Factory Boy factories associated with an SQLAlchemy session.
    """

    _factories = {}

    def __init__(self, fast_session: AsyncSession):
        """
        Initialize the FactorySetBase instance.


        Associates the provided SQLAlchemy session or database connection with the specified
        Factory Boy factories, making them available as attributes of the instance.


        Args:
            fast_session: An SQLAlchemy session or database connection to associate with the factories.
        """
        self.session = fast_session

        for attr_name, factory_cls in self._factories.items():
            factory_cls._meta.sqlalchemy_session = fast_session
            setattr(self, attr_name, factory_cls)

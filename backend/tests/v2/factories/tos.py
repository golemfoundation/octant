from datetime import datetime, timezone
from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import LazyAttribute, SubFactory

from app.infrastructure.database.models import User, UserConsents
from tests.v2.factories.base import FactorySetBase
from tests.v2.factories.users import UserFactory
from v2.core.types import Address


class UserConsentsFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = UserConsents
        sqlalchemy_session_persistence = "commit"

    user = SubFactory(UserFactory)
    ip = LazyAttribute(lambda _: "127.0.0.1")
    created_at = LazyAttribute(lambda _: datetime.now(timezone.utc))


class UserConsentsFactorySet(FactorySetBase):
    _factories = {"tos_consent": UserConsentsFactory}

    async def create(self, user: User | Address, ip: str | None = None) -> UserConsents:
        """Create a new TOS consent record."""
        factory_kwargs = {}

        if user is not None:
            factory_kwargs["user"] = user
        if ip is not None:
            factory_kwargs["ip"] = ip

        consent = await UserConsentsFactory.create(**factory_kwargs)
        return consent

    async def create_for_user_address(
        self, user_address: Address, ip: str | None = None
    ) -> UserConsents:
        """Create a TOS consent record for a user with the given address."""
        from tests.v2.factories import FactoriesAggregator

        # Get the factories aggregator to access user factory
        factories = FactoriesAggregator(self.session)

        # Get or create the user
        user = await factories.users.get_or_create(user_address)

        # Create the consent
        return await self.create(user_id=user.id, ip=ip)

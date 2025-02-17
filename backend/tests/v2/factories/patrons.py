from datetime import datetime, timezone
from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory

from app.infrastructure.database.models import PatronModeEvent, User
from tests.v2.factories.base import FactorySetBase
from tests.v2.factories.users import UserFactorySet
from v2.core.types import Address


class PatronModeEventFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = PatronModeEvent
        sqlalchemy_session_persistence = "commit"

    user_address = None
    patron_mode_enabled = True
    created_at = datetime.now(timezone.utc)


class PatronModeEventFactorySet(FactorySetBase):
    _factories = {"patron_event": PatronModeEventFactory}

    async def create(
        self,
        user: User | Address,
        patron_mode_enabled: bool = True,
        created_at: datetime | None = None,
    ) -> PatronModeEvent:
        """
        Create a patron mode event.

        Args:
            user: The user or user address to create the event for
            patron_mode_enabled: Whether patron mode is enabled (default: True)
            created_at: Optional timestamp for when the event was created (default: now)

        Returns:
            The created patron mode event
        """
        if not isinstance(user, User):
            user = await UserFactorySet(self.session).get_or_create(user)

        factory_kwargs = {
            "user_address": user.address,
            "patron_mode_enabled": patron_mode_enabled,
        }

        if created_at is not None:
            factory_kwargs["created_at"] = created_at

        event = await PatronModeEventFactory.create(**factory_kwargs)
        return event

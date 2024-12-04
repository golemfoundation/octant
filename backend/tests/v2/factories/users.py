import string

from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import LazyAttribute
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.contants import CHARLIE_ADDRESS, BOB_ADDRESS, ALICE_ADDRESS
from tests.v2.factories.base import FactorySetBase
import random
from app.infrastructure.database.models import User
from v2.core.types import Address


class UserFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = User

    address = LazyAttribute(
        lambda _: "0x" + "".join(random.choices(string.hexdigits, k=40))
    )


class UserFactorySet(FactorySetBase):
    _factories = {"user": UserFactory}

    async def create_user(self, **kwargs):
        return await UserFactory.create(**kwargs)

    async def get_or_create(self, session: AsyncSession, address: Address):
        user = await session.scalar(select(User).filter(User.address == address))
        if not user:
            user = await self.create_user(address=address)
        return user

    async def get_alice(self, session):
        return await self.get_or_create(session, ALICE_ADDRESS)

    async def get_bob(self, session):
        return await self.get_or_create(session, BOB_ADDRESS)

    async def get_charlie(self, session):
        return await self.get_or_create(session, CHARLIE_ADDRESS)

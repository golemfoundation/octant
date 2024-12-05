from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import LazyAttribute
from sqlalchemy import select

from app.infrastructure.database.models import User
from tests.v2.contants import CHARLIE_ADDRESS, BOB_ADDRESS, ALICE_ADDRESS
from tests.v2.factories.base import FactorySetBase
from tests.v2.factories.helpers import generate_random_eip55_address
from v2.core.types import Address


class UserFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = User
        sqlalchemy_session_persistence = "commit"

    address = LazyAttribute(generate_random_eip55_address)


class UserFactorySet(FactorySetBase):
    _factories = {"user": UserFactory}

    async def create_user(self, address: Address) -> User:
        factory_kwargs = {}

        if address is not None:
            factory_kwargs["address"] = address

        user = await UserFactory.create(**factory_kwargs)

        return user

    async def get_or_create(self, address: Address) -> User:
        user = await self.session.scalar(select(User).filter(User.address == address))
        if not user:
            user = await self.create_user(address=address)
        return user

    async def get_alice(self) -> User:
        return await self.get_or_create(ALICE_ADDRESS)

    async def get_bob(self) -> User:
        return await self.get_or_create(BOB_ADDRESS)

    async def get_charlie(self) -> User:
        return await self.get_or_create(CHARLIE_ADDRESS)

import random

from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import Sequence, LazyAttribute
from sqlalchemy import select

from app.infrastructure.database.models import Allocation, User
from tests.v2.factories import AllocationRequestFactorySet
from tests.v2.factories.base import FactorySetBase
from tests.v2.factories.helpers import generate_random_eip55_address
from tests.v2.factories.users import UserFactorySet
from v2.core.types import Address, BigInteger


class AllocationFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = Allocation
        sqlalchemy_session_persistence = "commit"

    user_id = None
    epoch = None
    project_address = LazyAttribute(lambda _: generate_random_eip55_address())
    amount = random.randint(1, 100000000)
    nonce = Sequence(lambda n: n + 1)


class AllocationFactorySet(FactorySetBase):
    _factories = {"allocation": AllocationFactory}

    async def create(
        self,
        user: User | Address,
        epoch: int,
        nonce: int | None = None,
        amount: BigInteger | None = None,
        project_address: Address | None = None,
    ) -> Allocation:
        if not isinstance(user, User):
            user = await UserFactorySet(self.session).get_or_create(user)

        await AllocationRequestFactorySet(self.session).create(
            user, epoch, False, nonce=nonce
        )  # every allocation has a corresponding allocation request

        factory_kwargs = {
            "user_id": user.id,
            "epoch": epoch,
        }

        if project_address is not None:
            factory_kwargs["project_address"] = project_address

        if amount is not None:
            factory_kwargs["amount"] = amount

        if nonce is not None:
            factory_kwargs["nonce"] = nonce

        allocation = await AllocationFactory.create(**factory_kwargs)
        return allocation

    async def get_by_user_and_epoch(
        self, user: User | Address, epoch: int
    ) -> list[Allocation]:
        results = await self.session.scalars(
            select(Allocation).where(
                Allocation.user_id == user.id, Allocation.epoch == epoch
            )
        )
        return list(results)

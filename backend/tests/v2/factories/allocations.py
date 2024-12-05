import random

from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import Sequence, LazyAttribute

from app.infrastructure.database.models import Allocation, User
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
    project_address = LazyAttribute(generate_random_eip55_address)
    amount = random.randint(1, 100000000)
    nonce = Sequence(lambda n: n + 1)


class AllocationFactorySet(FactorySetBase):
    _factories = {"allocation": AllocationFactory}

    async def create(
        self,
        user: User | Address,
        project_address: Address,
        amount: BigInteger,
        epoch: int,
    ):
        if not isinstance(user, User):
            user = await UserFactorySet(self.session).get_or_create(user)

        return await AllocationFactory.create(
            user_id=user.id,
            project_address=project_address,
            amount=amount,
            epoch=epoch,
        )

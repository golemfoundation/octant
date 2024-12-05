import random
import string

from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import Sequence, LazyAttribute

from app.infrastructure.database.models import AllocationRequest, User
from tests.v2.factories.base import FactorySetBase
from tests.v2.factories.helpers import generate_random_eip55_address
from tests.v2.factories.users import UserFactorySet
from v2.core.types import Address


class AllocationRequestFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = AllocationRequest

    user_id = None
    epoch = None
    nonce = Sequence(lambda n: n + 1)
    project_address = LazyAttribute(generate_random_eip55_address)
    signature = LazyAttribute(
        lambda _: "0x" + "".join(random.choices(string.hexdigits, k=64))
    )  # must reflect the real signature when allocating
    is_manually_edited = False
    leverage = None


class AllocationRequestFactorySet(FactorySetBase):
    _factories = {"allocation_request": AllocationRequestFactory}

    async def create_allocation_request(
        self,
        user: User | Address,
        epoch: int,
        nonce: int,
        signature: str,
        is_manually_edited: bool,
        leverage: float | None = None,
    ) -> AllocationRequest:
        if not isinstance(user, User):
            user = await UserFactorySet(self.session).get_or_create(user)

        allocation_request = await AllocationRequestFactory.create(
            user_id=user.id,
            epoch=epoch,
            nonce=nonce,
            signature=signature,
            leverage=leverage,
            is_manually_edited=is_manually_edited,
        )

        self.session.add(allocation_request)
        return allocation_request

import random
import string

from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import Sequence, LazyAttribute

from app.infrastructure.database.models import AllocationRequest, User
from tests.v2.factories.base import FactorySetBase
from tests.v2.factories.users import UserFactorySet
from v2.core.types import Address


class AllocationRequestFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = AllocationRequest
        sqlalchemy_session_persistence = "commit"

    user_id = None
    epoch = None
    nonce = Sequence(lambda n: n + 1)
    signature = LazyAttribute(
        lambda _: "0x" + "".join(random.choices(string.hexdigits, k=64))
    )  # must reflect the real signature when allocating
    is_manually_edited = False
    leverage = None


class AllocationRequestFactorySet(FactorySetBase):
    _factories = {"allocation_request": AllocationRequestFactory}

    async def create(
        self,
        user: User | Address,
        epoch: int,
        is_manually_edited: bool = False,
        nonce: int | None = None,
        signature: str | None = None,
        leverage: float | None = None,
    ) -> AllocationRequest:
        if not isinstance(user, User):
            user = await UserFactorySet(self.session).get_or_create(user)

        factory_kwargs = {
            "user_id": user.id,
            "epoch": epoch,
            "is_manually_edited": is_manually_edited,
        }

        if nonce is not None:
            factory_kwargs["nonce"] = nonce

        if signature is not None:
            factory_kwargs["signature"] = signature

        if leverage is not None:
            factory_kwargs["leverage"] = leverage

        allocation_request = await AllocationRequestFactory.create(**factory_kwargs)

        return allocation_request

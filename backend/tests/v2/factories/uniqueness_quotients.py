from decimal import Decimal
from typing import Optional

from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import SubFactory
from sqlalchemy import select

from app.infrastructure.database.models import UniquenessQuotient, User
from tests.v2.factories.base import FactorySetBase
from tests.v2.factories.users import UserFactory


class UniquenessQuotientFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = UniquenessQuotient
        sqlalchemy_session_persistence = "commit"

    user = SubFactory(UserFactory)
    epoch = 1
    score = "1.0"


class UniquenessQuotientFactorySet(FactorySetBase):
    _factories = {"uniqueness_quotient": UniquenessQuotientFactory}

    async def create(
        self,
        user: Optional[User] = None,
        epoch: Optional[int] = None,
        score: Optional[Decimal] = None,
    ) -> UniquenessQuotient:
        factory_kwargs = {}

        if user is not None:
            factory_kwargs["user"] = user
        if epoch is not None:
            factory_kwargs["epoch"] = epoch
        if score is not None:
            factory_kwargs["score"] = str(score)

        uq = await UniquenessQuotientFactory.create(**factory_kwargs)
        return uq

    async def get_or_create(
        self, user: User, epoch: int, score: Optional[Decimal] = None
    ) -> UniquenessQuotient:
        uq = await self.session.scalar(
            select(UniquenessQuotient).filter(
                UniquenessQuotient.user_id == user.id,
                UniquenessQuotient.epoch == epoch,
            )
        )

        if not uq:
            uq = await self.create(user=user, epoch=epoch, score=score)
        return uq

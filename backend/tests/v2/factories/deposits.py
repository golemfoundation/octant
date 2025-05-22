import random
from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory

from factory import LazyAttribute
from sqlalchemy import select
from app.infrastructure.database.models import Deposit, User
from tests.v2.factories.base import FactorySetBase


class DepositFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = Deposit
        sqlalchemy_session_persistence = "commit"

    epoch = 1
    user_id = 1
    effective_deposit = LazyAttribute(
        lambda _: str(random.randint(1, 1000) * 10**18)
    )  # Random amount in wei
    epoch_end_deposit = LazyAttribute(
        lambda _: str(random.randint(1, 1000) * 10**18)
    )  # Random amount in wei


class DepositFactorySet(FactorySetBase):
    _factories = {"deposit": DepositFactory}

    async def create(
        self,
        epoch: int = None,
        user: User = None,
        effective_deposit: int = None,
        epoch_end_deposit: int = None,
    ) -> Deposit:
        factory_kwargs = {}

        if epoch is not None:
            factory_kwargs["epoch"] = epoch

        if user is not None:
            factory_kwargs["user"] = user

        if effective_deposit is not None:
            factory_kwargs["effective_deposit"] = effective_deposit

        if epoch_end_deposit is not None:
            factory_kwargs["epoch_end_deposit"] = epoch_end_deposit

        deposit = await DepositFactory.create(**factory_kwargs)
        return deposit

    async def get_for_epoch(self, epoch_number: int) -> list[Deposit]:
        results = await self.session.scalars(
            select(Deposit).filter(Deposit.epoch == epoch_number)
        )
        return list(results)

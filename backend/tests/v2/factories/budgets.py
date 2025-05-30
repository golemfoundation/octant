import random
from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import LazyAttribute
from sqlalchemy import select

from app.infrastructure.database.models import Budget, User
from tests.v2.factories.base import FactorySetBase
from tests.v2.factories.users import UserFactorySet
from v2.core.types import Address, BigInteger


class BudgetFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = Budget
        sqlalchemy_session_persistence = "commit"

    user_id = None
    epoch = None
    budget = LazyAttribute(
        lambda _: str(random.randint(1, 1000) * 10**18)
    )  # Random amount in wei


class BudgetFactorySet(FactorySetBase):
    _factories = {"budget": BudgetFactory}

    async def create(
        self,
        user: User | Address,
        epoch: int,
        amount: BigInteger | None = None,
    ) -> Budget:
        """
        Create a budget for a user in a specific epoch.

        Args:
            user: The user or user address to create the budget for
            epoch: The epoch number
            amount: Optional specific amount, otherwise random

        Returns:
            The created budget
        """
        if not isinstance(user, User):
            user = await UserFactorySet(self.session).get_or_create(user)

        factory_kwargs = {
            "user_id": user.id,
            "epoch": epoch,
        }

        if amount is not None:
            factory_kwargs["budget"] = str(amount)

        budget = await BudgetFactory.create(**factory_kwargs)
        return budget

    async def get_for_epoch(self, epoch_number: int) -> list[Budget]:
        results = await self.session.scalars(
            select(Budget).filter(Budget.epoch == epoch_number)
        )
        return list(results)

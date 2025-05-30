import random
from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import LazyAttribute
from sqlalchemy import select

from app.infrastructure.database.models import Reward, User
from tests.v2.factories.base import FactorySetBase
from tests.v2.factories.users import UserFactorySet
from v2.core.types import Address


class RewardFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = Reward
        sqlalchemy_session_persistence = "commit"

    address = None
    epoch = None
    amount = LazyAttribute(lambda _: str(random.randint(1, 1000) * 10**18))
    matched = LazyAttribute(lambda _: str(random.randint(1, 500) * 10**18))


class RewardFactorySet(FactorySetBase):
    _factories = {"reward": RewardFactory}

    async def create(
        self,
        address: Address,
        epoch: int,
        amount: int | None = None,
        matched: int | None = None,
    ) -> Reward:
        """
        Create a reward for an address in a specific epoch.

        Args:
            address: The address to create the reward for
            epoch: The epoch number
            amount: Optional specific amount, otherwise random
            matched: Optional specific matched amount, otherwise random

        Returns:
            The created reward
        """
        factory_kwargs = {
            "address": address,
            "epoch": epoch,
        }

        if amount is not None:
            factory_kwargs["amount"] = str(amount)

        if matched is not None:
            factory_kwargs["matched"] = str(matched)

        reward = await RewardFactory.create(**factory_kwargs)
        return reward

    async def create_for_user(
        self,
        user: User | Address,
        epoch: int,
        amount: int | None = None,
        matched: int | None = None,
    ) -> Reward:
        """
        Create a reward for a user in a specific epoch.

        Args:
            user: The user or user address to create the reward for
            epoch: The epoch number
            amount: Optional specific amount, otherwise random
            matched: Optional specific matched amount, otherwise random

        Returns:
            The created reward
        """
        if not isinstance(user, User):
            user_obj = await UserFactorySet(self.session).get_or_create(user)
            address = user_obj.address
        else:
            address = user.address

        return await self.create(
            address=address,
            epoch=epoch,
            amount=amount,
            matched=matched,
        )

    async def get_for_epoch(self, epoch_number: int) -> list[Reward]:
        """
        Get all rewards for a specific epoch.
        """
        results = await self.session.scalars(
            select(Reward).where(Reward.epoch == epoch_number)
        )
        return list(results)

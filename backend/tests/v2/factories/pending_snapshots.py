import random
from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import LazyAttribute
from sqlalchemy import select

from app.infrastructure.database.models import PendingEpochSnapshot
from tests.v2.factories.base import FactorySetBase
from v2.core.types import BigInteger


class PendingEpochSnapshotFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = PendingEpochSnapshot
        sqlalchemy_session_persistence = "commit"

    epoch = None
    eth_proceeds = LazyAttribute(lambda _: str(random.randint(1, 1000) * 10**18))
    total_effective_deposit = LazyAttribute(
        lambda _: str(random.randint(1, 1000) * 10**18)
    )
    locked_ratio = LazyAttribute(lambda _: str(random.randint(1, 100)))
    total_rewards = LazyAttribute(lambda _: str(random.randint(1, 1000) * 10**18))
    vanilla_individual_rewards = LazyAttribute(
        lambda _: str(random.randint(1, 1000) * 10**18)
    )
    operational_cost = LazyAttribute(lambda _: str(random.randint(1, 100) * 10**18))
    ppf = LazyAttribute(lambda _: str(random.randint(1, 100) * 10**18))
    community_fund = LazyAttribute(lambda _: str(random.randint(1, 100) * 10**18))


class PendingEpochSnapshotFactorySet(FactorySetBase):
    _factories = {"pending_snapshot": PendingEpochSnapshotFactory}

    async def create(
        self,
        epoch: int,
        eth_proceeds: BigInteger | None = None,
        total_effective_deposit: BigInteger | None = None,
        locked_ratio: BigInteger | None = None,
        total_rewards: BigInteger | None = None,
        vanilla_individual_rewards: BigInteger | None = None,
        operational_cost: BigInteger | None = None,
        ppf: BigInteger | None = None,
        community_fund: BigInteger | None = None,
    ) -> PendingEpochSnapshot:
        """
        Create a pending epoch snapshot.

        Args:
            epoch: The epoch number
            eth_proceeds: Optional ETH proceeds amount
            total_effective_deposit: Optional total effective deposit amount
            locked_ratio: Optional locked ratio
            total_rewards: Optional total rewards amount
            vanilla_individual_rewards: Optional vanilla individual rewards amount
            operational_cost: Optional operational cost amount
            ppf: Optional PPF amount
            community_fund: Optional community fund amount

        Returns:
            The created pending epoch snapshot
        """
        factory_kwargs = {
            "epoch": epoch,
        }

        if eth_proceeds is not None:
            factory_kwargs["eth_proceeds"] = str(eth_proceeds)
        if total_effective_deposit is not None:
            factory_kwargs["total_effective_deposit"] = str(total_effective_deposit)
        if locked_ratio is not None:
            factory_kwargs["locked_ratio"] = str(locked_ratio)
        if total_rewards is not None:
            factory_kwargs["total_rewards"] = str(total_rewards)
        if vanilla_individual_rewards is not None:
            factory_kwargs["vanilla_individual_rewards"] = str(
                vanilla_individual_rewards
            )
        if operational_cost is not None:
            factory_kwargs["operational_cost"] = str(operational_cost)
        if ppf is not None:
            factory_kwargs["ppf"] = str(ppf)
        if community_fund is not None:
            factory_kwargs["community_fund"] = str(community_fund)

        snapshot = await PendingEpochSnapshotFactory.create(**factory_kwargs)
        return snapshot

    async def get(self, epoch_number: int) -> PendingEpochSnapshot | None:
        return await self.session.scalar(
            select(PendingEpochSnapshot).filter(
                PendingEpochSnapshot.epoch == epoch_number
            )
        )

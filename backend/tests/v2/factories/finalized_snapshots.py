import random
from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import LazyAttribute
from sqlalchemy import select

from app.infrastructure.database.models import FinalizedEpochSnapshot
from tests.v2.factories.base import FactorySetBase
from v2.core.types import BigInteger


class FinalizedEpochSnapshotFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = FinalizedEpochSnapshot
        sqlalchemy_session_persistence = "commit"

    epoch = None
    matched_rewards = LazyAttribute(lambda _: str(random.randint(1, 1000) * 10**18))
    patrons_rewards = LazyAttribute(lambda _: str(random.randint(1, 1000) * 10**18))
    leftover = LazyAttribute(lambda _: str(random.randint(1, 100) * 10**18))
    withdrawals_merkle_root = LazyAttribute(
        lambda _: "0x" + "".join(random.choices("0123456789abcdef", k=64))
    )
    total_withdrawals = LazyAttribute(lambda _: str(random.randint(1, 1000) * 10**18))


class FinalizedEpochSnapshotFactorySet(FactorySetBase):
    _factories = {"finalized_snapshot": FinalizedEpochSnapshotFactory}

    async def create(
        self,
        epoch: int,
        matched_rewards: BigInteger | None = None,
        patrons_rewards: BigInteger | None = None,
        leftover: BigInteger | None = None,
        withdrawals_merkle_root: str | None = None,
        total_withdrawals: BigInteger | None = None,
    ) -> FinalizedEpochSnapshot:
        """
        Create a finalized epoch snapshot.

        Args:
            epoch: The epoch number
            matched_rewards: Optional matched rewards amount
            patrons_rewards: Optional patrons rewards amount
            leftover: Optional leftover amount
            withdrawals_merkle_root: Optional withdrawals merkle root
            total_withdrawals: Optional total withdrawals amount

        Returns:
            The created finalized epoch snapshot
        """
        factory_kwargs = {
            "epoch": epoch,
        }

        if matched_rewards is not None:
            factory_kwargs["matched_rewards"] = str(matched_rewards)
        if patrons_rewards is not None:
            factory_kwargs["patrons_rewards"] = str(patrons_rewards)
        if leftover is not None:
            factory_kwargs["leftover"] = str(leftover)
        if withdrawals_merkle_root is not None:
            factory_kwargs["withdrawals_merkle_root"] = withdrawals_merkle_root
        if total_withdrawals is not None:
            factory_kwargs["total_withdrawals"] = str(total_withdrawals)

        snapshot = await FinalizedEpochSnapshotFactory.create(**factory_kwargs)
        return snapshot

    async def get(self, epoch_number: int) -> FinalizedEpochSnapshot | None:
        """
        Get a finalized epoch snapshot by epoch number.
        """

        return await self.session.scalar(
            select(FinalizedEpochSnapshot).where(
                FinalizedEpochSnapshot.epoch == epoch_number
            )
        )

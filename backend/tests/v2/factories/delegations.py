from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory

from app.infrastructure.database.models import ScoreDelegation
from tests.v2.factories.base import FactorySetBase


class ScoreDelegationFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = ScoreDelegation
        sqlalchemy_session_persistence = "commit"

    hashed_addr = "0x1234123456123456123456123456123456123456"


class ScoreDelegationFactorySet(FactorySetBase):
    _factories = {"score_delegation": ScoreDelegationFactory}

    async def create(
        self,
        hashed_addr: str = None,
    ) -> ScoreDelegation:
        factory_kwargs = {}

        if hashed_addr is not None:
            factory_kwargs["hashed_addr"] = hashed_addr

        score_delegation = await ScoreDelegationFactory.create(**factory_kwargs)
        return score_delegation

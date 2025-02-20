from datetime import datetime, timedelta

from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import SubFactory
from sqlalchemy import select

from app.infrastructure.database.models import GPStamps, User
from tests.v2.factories.base import FactorySetBase
from tests.v2.factories.users import UserFactory


class GPStampsFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = GPStamps
        sqlalchemy_session_persistence = "commit"

    user_id = SubFactory(UserFactory)
    score = 1.0
    expires_at = datetime.now() + timedelta(days=30)
    stamps = "[]"  # Default empty JSON array as string


class GPStampsFactorySet(FactorySetBase):
    _factories = {"gp_stamps": GPStampsFactory}

    async def create(
        self,
        user: User = None,
        score: float = None,
        expires_at: datetime = None,
        stamps: str = None,
    ) -> GPStamps:
        factory_kwargs = {}

        if user is not None:
            factory_kwargs["user_id"] = user.id
        if score is not None:
            factory_kwargs["score"] = score
        if expires_at is not None:
            factory_kwargs["expires_at"] = expires_at
        if stamps is not None:
            factory_kwargs["stamps"] = stamps

        gp_stamps = await GPStampsFactory.create(**factory_kwargs)
        return gp_stamps

    async def get_or_create(
        self,
        user: User,
        score: float = None,
        expires_at: datetime = None,
        stamps: str = None,
    ) -> GPStamps:
        gp_stamps = await self.session.scalar(
            select(GPStamps).filter(GPStamps.user_id == user.id)
        )

        if not gp_stamps:
            gp_stamps = await self.create(
                user=user,
                score=score,
                expires_at=expires_at,
                stamps=stamps,
            )
        return gp_stamps

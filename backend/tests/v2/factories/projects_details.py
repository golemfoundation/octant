from async_factory_boy.factory.sqlalchemy import AsyncSQLAlchemyFactory
from factory import LazyAttribute

from app.infrastructure.database.models import ProjectsDetails
from tests.v2.factories.base import FactorySetBase
from tests.v2.factories.helpers import generate_random_eip55_address
from v2.core.types import Address


class ProjectsDetailsFactory(AsyncSQLAlchemyFactory):
    class Meta:
        model = ProjectsDetails
        sqlalchemy_session_persistence = "commit"

    address = LazyAttribute(lambda _: generate_random_eip55_address())
    name = None
    epoch = None


class ProjectsDetailsFactorySet(FactorySetBase):
    _factories = {"projects_details": ProjectsDetailsFactory}

    async def create(
        self,
        name: str,
        epoch: int,
        address: Address | None = None,
    ) -> ProjectsDetails:
        factory_kwargs = {
            "address": address,
            "name": name,
            "epoch": epoch,
        }

        if address is not None:
            factory_kwargs["address"] = address

        projects_details = await ProjectsDetailsFactory.create(**factory_kwargs)

        return projects_details

from app.infrastructure.database.models import BaseModel
from pydantic import Field
from pydantic_settings import BaseSettings

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker
from web3 import AsyncHTTPProvider, AsyncWeb3
from web3.middleware import async_geth_poa_middleware


class Web3ProviderSettings(BaseSettings):
    eth_rpc_provider_url: str


# TODO: Cache?
def get_w3(eth_rpc_provider_url: str) -> AsyncWeb3:
    w3 = AsyncWeb3(provider=AsyncHTTPProvider(eth_rpc_provider_url))
    if async_geth_poa_middleware not in w3.middleware_onion:
        w3.middleware_onion.inject(async_geth_poa_middleware, layer=0)

    return w3


def w3_getter() -> AsyncWeb3:
    settings = Web3ProviderSettings()
    return get_w3(settings.eth_rpc_provider_url)


class DatabaseSettings(BaseSettings):
    sqlalchemy_database_uri: str = Field(validation_alias="db_uri")
    # TODO other settings of the database


async def create_tables():
    settings = DatabaseSettings()
    engine = create_async_engine(settings.sqlalchemy_database_uri)
    async with engine.begin() as conn:
        await conn.run_sync(BaseModel.metadata.create_all)


def get_db_engine(database_uri: str) -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(database_uri)

    return sessionmaker(bind=engine, class_=AsyncSession)


def db_getter() -> async_sessionmaker[AsyncSession]:
    settings = DatabaseSettings()
    return get_db_engine(settings.sqlalchemy_database_uri)

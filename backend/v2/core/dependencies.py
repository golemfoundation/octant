from contextlib import asynccontextmanager
from typing import Annotated, AsyncGenerator

from fastapi import Depends
from app.infrastructure.database.models import BaseModel
from pydantic import Field
from pydantic_settings import BaseSettings

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from web3 import AsyncHTTPProvider, AsyncWeb3
from web3.middleware import async_geth_poa_middleware


class Web3ProviderSettings(BaseSettings):
    eth_rpc_provider_url: str


def get_w3(
    settings: Annotated[Web3ProviderSettings, Depends(Web3ProviderSettings)]
) -> AsyncWeb3:
    w3 = AsyncWeb3(provider=AsyncHTTPProvider(settings.eth_rpc_provider_url))
    if async_geth_poa_middleware not in w3.middleware_onion:
        w3.middleware_onion.inject(async_geth_poa_middleware, layer=0)

    return w3


Web3 = Annotated[AsyncWeb3, Depends(get_w3)]


class DatabaseSettings(BaseSettings):
    sqlalchemy_database_uri: str = Field(validation_alias="db_uri")
    # TODO other settings of the database


async def create_tables():
    settings = DatabaseSettings()
    engine = create_async_engine(settings.sqlalchemy_database_uri)
    async with engine.begin() as conn:
        await conn.run_sync(BaseModel.metadata.create_all)


@asynccontextmanager
async def get_db_session(
    settings: Annotated[DatabaseSettings, Depends(DatabaseSettings)]
) -> AsyncGenerator[AsyncSession, None]:
    # Create an async SQLAlchemy engine

    # logging.error("Creating database engine")

    engine = create_async_engine(settings.sqlalchemy_database_uri)

    # Create a sessionmaker with AsyncSession class
    async_session = async_sessionmaker(
        autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
    )

    # logging.error("Opening session", async_session)

    # Create a new session
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


AsyncDbSession = Annotated[AsyncSession, Depends(get_db_session)]

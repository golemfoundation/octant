from asyncio import current_task
from contextlib import asynccontextmanager
from functools import lru_cache
from typing import Annotated, AsyncGenerator

from fastapi import Depends
from app.infrastructure.database.models import BaseModel
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine, async_scoped_session
from web3 import AsyncHTTPProvider, AsyncWeb3
from web3.middleware import async_geth_poa_middleware


class OctantSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore', frozen=True)


class Web3ProviderSettings(OctantSettings):
    eth_rpc_provider_url: str


def get_web3_provider_settings() -> Web3ProviderSettings:
    return Web3ProviderSettings()

def get_w3(
    settings: Annotated[Web3ProviderSettings, Depends(get_web3_provider_settings)]
) -> AsyncWeb3:
    w3 = AsyncWeb3(provider=AsyncHTTPProvider(settings.eth_rpc_provider_url))
    if async_geth_poa_middleware not in w3.middleware_onion:
        w3.middleware_onion.inject(async_geth_poa_middleware, layer=0)

    return w3


Web3 = Annotated[AsyncWeb3, Depends(get_w3)]


class DatabaseSettings(OctantSettings):
    db_uri: str = Field(..., alias="db_uri")
    # TODO other settings of the database

    @property
    def sqlalchemy_database_uri(self) -> str:
        return self.db_uri.replace("postgresql://", "postgresql+asyncpg://")


def get_database_settings() -> DatabaseSettings:
    return DatabaseSettings()


async def create_tables():
    settings = DatabaseSettings()
    engine = create_async_engine(settings.sqlalchemy_database_uri)
    async with engine.begin() as conn:
        await conn.run_sync(BaseModel.metadata.create_all)


@lru_cache(1)
def get_sessionmaker(
    settings: Annotated[DatabaseSettings, Depends(get_database_settings)]
) -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(
        settings.sqlalchemy_database_uri,
        echo=False,                    # Disable SQL query logging (for performance)
        pool_size=100,                 # Initial pool size (default is 5)
        max_overflow=10,               # Extra connections if pool is exhausted
        pool_timeout=30,               # Timeout before giving up on a connection
        pool_recycle=3600,             # Recycle connections after 1 hour (for long-lived connections)
        pool_pre_ping=True,            # Check if the connection is alive before using it
        future=True,                   # Use the future-facing SQLAlchemy 2.0 style
        # connect_args={"options": "-c timezone=utc"}  # Ensures timezone is UTC
    )

    sessionmaker = async_sessionmaker(
        autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
    )

    scoped_session = async_scoped_session(sessionmaker, scopefunc=current_task)

    return scoped_session

# @asynccontextmanager
async def get_db_session(
    sessionmaker: Annotated[async_sessionmaker[AsyncSession], Depends(get_sessionmaker)]
) -> AsyncGenerator[AsyncSession, None]:
    # Create an async SQLAlchemy engine

    # logging.error("Creating database engine")

    # engine = create_async_engine(
    #     settings.sqlalchemy_database_uri,
    #     echo=False,                    # Disable SQL query logging (for performance)
    #     pool_size=20,                  # Initial pool size (default is 5)
    #     max_overflow=10,               # Extra connections if pool is exhausted
    #     pool_timeout=30,               # Timeout before giving up on a connection
    #     pool_recycle=3600,             # Recycle connections after 1 hour (for long-lived connections)
    #     pool_pre_ping=True,            # Check if the connection is alive before using it
    #     future=True,                   # Use the future-facing SQLAlchemy 2.0 style
    #     # connect_args={"options": "-c timezone=utc"}  # Ensures timezone is UTC
    # )

    # # Create a sessionmaker with AsyncSession class
    # async_session = async_sessionmaker(
    #     autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
    # )

    # logging.error("Opening session", async_session)

    # Create a new session
    async with sessionmaker() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            print("----Rolling back session, error:", e)
            await session.rollback()
            raise
        finally:
            print("----Closing session")
            await session.close()


GetSession = Annotated[AsyncSession, Depends(get_db_session)]

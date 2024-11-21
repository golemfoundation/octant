from functools import lru_cache
from typing import Annotated, AsyncGenerator

from fastapi import Depends
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from web3 import AsyncHTTPProvider, AsyncWeb3
from web3.middleware import async_geth_poa_middleware


class OctantSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", frozen=True)


class Web3ProviderSettings(OctantSettings):
    eth_rpc_provider_url: str


def get_web3_provider_settings() -> Web3ProviderSettings:
    return Web3ProviderSettings()  # type: ignore[call-arg]


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
        if "postgresql://" in self.db_uri:
            return self.db_uri.replace("postgresql://", "postgresql+asyncpg://")

        if "sqlite://" in self.db_uri:
            return self.db_uri.replace("sqlite://", "sqlite+aiosqlite://")

        raise ValueError("Unsupported database URI")


def get_database_settings() -> DatabaseSettings:
    return DatabaseSettings()  # type: ignore[call-arg]


@lru_cache(1)
def get_sessionmaker(
    settings: Annotated[DatabaseSettings, Depends(get_database_settings)]
) -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(
        settings.sqlalchemy_database_uri,
        echo=False,  # Disable SQL query logging (for performance)
        pool_size=100,  # Initial pool size (default is 5)
        max_overflow=10,  # Extra connections if pool is exhausted
        pool_timeout=30,  # Timeout before giving up on a connection
        pool_recycle=3600,  # Recycle connections after 1 hour (for long-lived connections)
        pool_pre_ping=True,  # Check if the connection is alive before using it
        future=True,  # Use the future-facing SQLAlchemy 2.0 style
        # connect_args={"options": "-c timezone=utc"}  # Ensures timezone is UTC
    )

    sessionmaker = async_sessionmaker(
        autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
    )

    return sessionmaker


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

    # scoped_session = async_scoped_session(sessionmaker, scopefunc=current_task)

    # Create a new session
    async with sessionmaker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


GetSession = Annotated[AsyncSession, Depends(get_db_session, use_cache=False)]


class ChainSettings(OctantSettings):
    chain_id: int = Field(
        default=11155111,
        description="The chain id to use for the signature verification.",
    )


def get_chain_settings() -> ChainSettings:
    return ChainSettings()


GetChainSettings = Annotated[ChainSettings, Depends(get_chain_settings)]


class SocketioSettings(OctantSettings):
    host: str = Field(..., alias="SOCKETIO_REDIS_HOST")
    port: int = Field(..., alias="SOCKETIO_REDIS_PORT")
    password: str = Field(..., alias="SOCKETIO_REDIS_PASSWORD")
    db: int = Field(..., alias="SOCKETIO_REDIS_DB")

    @property
    def url(self) -> str:
        return f"redis://:{self.password}@{self.host}:{self.port}/{self.db}"


def get_socketio_settings() -> SocketioSettings:
    return SocketioSettings()  # type: ignore[call-arg]


GetSocketioSettings = Annotated[SocketioSettings, Depends(get_socketio_settings)]

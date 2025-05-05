from __future__ import annotations
from datetime import datetime, timezone
import time
from functools import lru_cache
from typing import Annotated, AsyncGenerator, Literal

from fastapi import Depends
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from web3 import AsyncHTTPProvider, AsyncWeb3
from web3.middleware import async_geth_poa_middleware

from app.shared.blockchain_types import ChainTypes
from v2.core.logic import compare_blockchain_types


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


class DatabaseSettings(OctantSettings):
    """
    Values below are the defaults for the pod which can serve up to 100 connections.
    """

    db_uri: str = Field(..., alias="db_uri")

    pg_pool_size: int = Field(67, alias="sqlalchemy_connection_pool_size")
    pg_max_overflow: int = Field(33, alias="sqlalchemy_connection_pool_max_overflow")
    pg_pool_timeout: int = 60
    pg_pool_recycle: int = 30 * 60  # 30 minutes
    pg_pool_pre_ping: bool = True

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
    kw = {}
    if "postgresql" in settings.sqlalchemy_database_uri:
        kw = {
            "pool_size": settings.pg_pool_size,
            "max_overflow": settings.pg_max_overflow,
            "pool_timeout": settings.pg_pool_timeout,
            "pool_recycle": settings.pg_pool_recycle,
            "pool_pre_ping": settings.pg_pool_pre_ping,
        }

    engine = create_async_engine(
        settings.sqlalchemy_database_uri,
        echo=False,  # Disable SQL query logging (for performance)
        future=True,  # Use the future-facing SQLAlchemy 2.0 style
        **kw,
    )

    sessionmaker = async_sessionmaker(
        autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
    )

    return sessionmaker


async def get_db_session(
    sessionmaker: GetSessionmaker,
) -> AsyncGenerator[AsyncSession, None]:
    async with sessionmaker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


class ChainSettings(OctantSettings):
    chain_id: int = Field(
        default=11155111,
        description="The chain id to use for the signature verification.",
    )
    chain_name: str = Field(
        default="unknown",
        description="The name of the chain to use for the signature verification.",
    )

    @property
    def is_mainnet(self) -> bool:
        return compare_blockchain_types(self.chain_id, ChainTypes.MAINNET)


def get_chain_settings() -> ChainSettings:
    return ChainSettings()


class EnvironmentSettings(OctantSettings):
    octant_env: str = Field(
        default="development",
        description="Octant environment of the deployment",
    )
    deployment_id: str = Field(
        default="unknown",
        description="Deployment id of the deployment",
    )

    @property
    def env(self) -> Literal["prod", "dev"]:
        return "prod" if self.octant_env == "production" else "dev"


def get_environment_settings() -> EnvironmentSettings:
    return EnvironmentSettings()


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


def get_current_timestamp() -> int:
    return int(time.time())


def get_current_datetime(
    current_timestamp: Annotated[int, Depends(get_current_timestamp)]
) -> datetime:
    return datetime.fromtimestamp(current_timestamp, timezone.utc).replace(tzinfo=None)


GetSocketioSettings = Annotated[SocketioSettings, Depends(get_socketio_settings)]
GetChainSettings = Annotated[ChainSettings, Depends(get_chain_settings)]
GetEnvironmentSettings = Annotated[
    EnvironmentSettings, Depends(get_environment_settings)
]
Web3 = Annotated[AsyncWeb3, Depends(get_w3)]
GetSessionmaker = Annotated[async_sessionmaker[AsyncSession], Depends(get_sessionmaker)]
GetSession = Annotated[AsyncSession, Depends(get_db_session)]
GetCurrentTimestamp = Annotated[int, Depends(get_current_timestamp)]
GetCurrentDatetime = Annotated[datetime, Depends(get_current_datetime)]

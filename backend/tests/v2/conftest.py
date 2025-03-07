from typing import AsyncGenerator
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import pytest_asyncio

from tests.v2.factories import FactoriesAggregator
from v2.core.dependencies import get_sessionmaker
from v2.main import app as fastapi_app
from app.extensions import db


@pytest.fixture(scope="function")
def fast_app() -> FastAPI:
    return fastapi_app


@pytest.fixture(scope="function")
def fast_client(fast_app: FastAPI) -> AsyncClient:
    return AsyncClient(transport=ASGITransport(app=fast_app), base_url="http://test")


@pytest_asyncio.fixture(scope="function")
async def fast_session(
    fast_app: FastAPI,
) -> AsyncGenerator[AsyncSession, None]:
    # For testing purposes, we use an in-memory SQLite database
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")

    # Create the tables
    async with engine.begin() as conn:
        await conn.run_sync(db.metadata.create_all)

    # mock of the get_sessionmaker dependency to use in-memory SQLite database
    def get_db_session_override() -> async_sessionmaker[AsyncSession]:
        sessionmaker = async_sessionmaker(bind=engine, expire_on_commit=False)
        return sessionmaker

    # override the get_sessionmaker dependency
    fast_app.dependency_overrides[get_sessionmaker] = get_db_session_override

    # return for testing
    yield get_db_session_override()()

    # remove the override
    del fast_app.dependency_overrides[get_sessionmaker]

    # drop the tables
    async with engine.begin() as conn:
        await conn.run_sync(db.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def factories(fast_session: AsyncSession) -> FactoriesAggregator:
    return FactoriesAggregator(fast_session)

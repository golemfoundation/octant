from http import HTTPStatus

import pytest
from fastapi import FastAPI
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_version(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    monkeypatch,
):
    """Should return application version information"""
    # Step 1: Set up environment variables using monkeypatch
    monkeypatch.setenv("CHAIN_NAME", "TestChain")
    monkeypatch.setenv("OCTANT_ENV", "development")
    monkeypatch.setenv("DEPLOYMENT_ID", "test-deployment-123")

    # Step 2: Call the API endpoint
    async with fast_client as client:
        resp = await client.get("info/version")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Step 3: Verify the version info
        assert result["id"] == "test-deployment-123"
        assert result["env"] == "dev"
        assert result["chain"] == "TestChain"

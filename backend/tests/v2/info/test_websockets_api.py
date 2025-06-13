from http import HTTPStatus

import pytest
from fastapi import FastAPI
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_websockets_api(
    fast_app: FastAPI,
    fast_client: AsyncClient,
):
    """Should return the websockets API documentation"""
    async with fast_client as client:
        resp = await client.get("info/websockets-api")
        assert resp.status_code == HTTPStatus.OK
        assert "text/html" in resp.headers["content-type"]
        assert "<html>" in resp.text, "Response should contain HTML content"
        assert (
            "Octant websockets API documentation" in resp.text
        ), "Response should contain the correct title"


@pytest.mark.asyncio
async def test_get_websockets_api_yaml(
    fast_app: FastAPI,
    fast_client: AsyncClient,
):
    """Should return the websockets API YAML documentation"""

    async with fast_client as client:
        resp = await client.get("info/websockets-api.yaml")
        assert resp.status_code == HTTPStatus.OK
        assert "text/plain" in resp.headers["content-type"]
        assert (
            "asyncapi: 2.0.0" in resp.text
        ), "Response should contain the correct AsyncAPI version"
        assert (
            "title: Octant websockets API" in resp.text
        ), "Response should contain the correct title"

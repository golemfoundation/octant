from http import HTTPStatus
from fastapi import FastAPI
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.common.crypto.signature import EncodingStandardFor, encode_for_signing
from app.modules.user.tos.core import build_consent_message
from v2.users.dependencies import XHeadersSettings, get_x_headers_settings
from tests.v2.factories import FactoriesAggregator


@pytest.mark.asyncio
async def test_get_tos_status_not_accepted(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return false for a user who hasn't accepted TOS"""
    alice = await factories.users.get_or_create_alice()

    async with fast_client as client:
        resp = await client.get(f"user/{alice.address}/tos")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"accepted": False}


@pytest.mark.asyncio
async def test_get_tos_status_accepted(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return true for a user who has accepted TOS"""
    alice = await factories.users.get_or_create_alice()
    await factories.tos_consents.create(user=alice)

    async with fast_client as client:
        resp = await client.get(f"user/{alice.address}/tos")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"accepted": True}


@pytest.mark.asyncio
async def test_post_tos_status_success(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should successfully accept TOS for a new user"""
    user, eth_account = await factories.users.create_random_user()

    # Generate valid signature
    msg_text = build_consent_message(user.address)
    signature = eth_account.sign_message(
        encode_for_signing(EncodingStandardFor.TEXT, msg_text)
    ).signature.hex()

    async with fast_client as client:
        resp = await client.post(
            f"user/{user.address}/tos",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"accepted": True}


@pytest.mark.asyncio
async def test_post_tos_status_duplicate(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should fail when user tries to accept TOS twice"""
    alice, eth_account = await factories.users.create_random_user()
    await factories.tos_consents.create(user=alice)

    # Generate valid signature
    msg_text = build_consent_message(alice.address)
    signature = eth_account.sign_message(
        encode_for_signing(EncodingStandardFor.TEXT, msg_text)
    ).signature.hex()

    async with fast_client as client:
        resp = await client.post(
            f"user/{alice.address}/tos",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "already accepted the Terms of Service" in resp.json()["message"]


@pytest.mark.asyncio
async def test_post_tos_status_invalid_signature(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should fail when user provides invalid signature"""
    alice, eth_account = await factories.users.create_random_user()

    # Generate invalid signature
    msg_text = build_consent_message(alice.address)
    signature = eth_account.sign_message(
        encode_for_signing(EncodingStandardFor.TEXT, msg_text)
    ).signature.hex()
    # This is to make the signature invalid
    if signature.endswith("1234"):
        signature = signature[:-4] + "4321"
    else:
        signature = signature[:-4] + "1234"

    async with fast_client as client:
        resp = await client.post(
            f"user/{alice.address}/tos",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "is invalid" in resp.json()["message"]


@pytest.mark.asyncio
async def test_post_tos_status_wrong_signer(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should fail when user provides signature from wrong signer"""
    alice, eth_account = await factories.users.create_random_user()
    bob, eth_account_bob = await factories.users.create_random_user()

    # Generate valid signature
    msg_text = build_consent_message(alice.address)
    signature = eth_account.sign_message(
        encode_for_signing(EncodingStandardFor.TEXT, msg_text)
    ).signature.hex()

    async with fast_client as client:
        resp = await client.post(
            f"user/{bob.address}/tos",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "is invalid" in resp.json()["message"]


@pytest.mark.asyncio
async def test_post_tos_status_missing_x_real_ip(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should fail when X-Real-IP header is required but missing"""
    # Configure app to require X-Real-IP header
    fast_app.dependency_overrides[get_x_headers_settings] = lambda: XHeadersSettings(
        x_real_ip_required=True
    )

    user, eth_account = await factories.users.create_random_user()

    # Generate valid signature
    msg_text = build_consent_message(user.address)
    signature = eth_account.sign_message(
        encode_for_signing(EncodingStandardFor.TEXT, msg_text)
    ).signature.hex()

    async with fast_client as client:
        resp = await client.post(
            f"user/{user.address}/tos",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "header is missing" in resp.json()["message"]

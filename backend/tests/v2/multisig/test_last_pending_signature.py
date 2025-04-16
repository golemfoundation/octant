from http import HTTPStatus
import json
from unittest.mock import MagicMock, AsyncMock
from fastapi import FastAPI
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.multisig_signature import SigStatus
from app.modules.dto import SignatureOpType
from app.modules.user.tos.core import build_consent_message
from app.context.epoch.details import EpochDetails
from v2.epochs.dependencies import get_epochs_contracts, get_epochs_subgraph
from v2.projects.dependencies import get_projects_contracts
from v2.multisig.dependencies import get_safe_contracts_factory, get_safe_client
from tests.v2.factories import FactoriesAggregator


@pytest.mark.asyncio
async def test_get_last_pending_signature_success_allocation(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return the last pending signature for a valid user and type"""
    # Create a pending epoch snapshot
    alice = await factories.users.get_or_create_alice()

    signature = await factories.multisig_signatures.create(
        address=alice.address,
        op_type=SignatureOpType.ALLOCATION,
        status=SigStatus.PENDING,
    )

    async with fast_client as client:
        resp = await client.get(
            f"multisig-signatures/pending/{alice.address}/type/{SignatureOpType.ALLOCATION}"
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "message": signature.message,
            "hash": signature.safe_msg_hash,
        }


@pytest.mark.asyncio
async def test_get_last_pending_signature_no_signature(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    factories: FactoriesAggregator,
):
    """Should return 404 if no signature is found"""
    alice = await factories.users.get_or_create_alice()

    async with fast_client as client:
        resp = await client.get(
            f"multisig-signatures/pending/{alice.address}/type/{SignatureOpType.ALLOCATION}"
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"message": None, "hash": None}

        resp = await client.get(
            f"multisig-signatures/pending/{alice.address}/type/{SignatureOpType.TOS}"
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"message": None, "hash": None}


@pytest.mark.asyncio
async def test_get_last_pending_signature_success_tos(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    alice = await factories.users.get_or_create_alice()

    signature = await factories.multisig_signatures.create(
        address=alice.address,
        op_type=SignatureOpType.TOS,
        status=SigStatus.PENDING,
    )

    async with fast_client as client:
        resp = await client.get(
            f"multisig-signatures/pending/{alice.address}/type/{SignatureOpType.TOS}"
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "message": signature.message,
            "hash": signature.safe_msg_hash,
        }


@pytest.mark.asyncio
async def test_get_last_pending_signature_invalid_op_type(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return 422 if the op type is invalid"""
    alice = await factories.users.get_or_create_alice()

    async with fast_client as client:
        resp = await client.get(
            f"multisig-signatures/pending/{alice.address}/type/SOMETHING_ELSE"
        )
        assert resp.status_code == HTTPStatus.UNPROCESSABLE_ENTITY


@pytest.mark.asyncio
async def test_add_pending_signature_success_tos(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should add a pending signature for TOS"""

    alice = await factories.users.get_or_create_alice()

    # Mock the safe contracts factory & client
    safe_contracts_factory = MagicMock()
    safe_contracts_factory.get_message_hash = AsyncMock(
        return_value="0x1234567890abcdef"
    )
    safe_contracts_factory.get_safe_message_hash_for_tos.return_value = (
        "fedcba9876543210"
    )

    safe_client = MagicMock()
    safe_client.get_message_details = AsyncMock(return_value={"safe": alice.address})

    # Override the dependencies
    fast_app.dependency_overrides[
        get_safe_contracts_factory
    ] = lambda: safe_contracts_factory
    fast_app.dependency_overrides[get_safe_client] = lambda: safe_client
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: None
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: None
    fast_app.dependency_overrides[get_projects_contracts] = lambda: None

    consent_msg = build_consent_message(alice.address)

    async with fast_client as client:
        resp = await client.post(
            f"multisig-signatures/pending/{alice.address}/type/{SignatureOpType.TOS}",
            json={"message": consent_msg},
            headers={"X-Real-IP": "127.0.0.1"},
        )
        assert resp.status_code == HTTPStatus.CREATED

        # Check if the signature was added to the database
        resp = await client.get(
            f"multisig-signatures/pending/{alice.address}/type/{SignatureOpType.TOS}"
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"message": consent_msg, "hash": "fedcba9876543210"}


@pytest.mark.asyncio
async def test_add_pending_signature_success_allocation(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should add a pending signature for ALLOCATION"""
    alice = await factories.users.get_or_create_alice()

    # Add budget to the user
    await factories.budgets.create(
        user=alice.address,
        epoch=1,
        amount=1000000000000000000,
    )

    # Mock the safe contracts factory & client
    safe_contracts_factory = MagicMock()
    safe_contracts_factory.get_message_hash = AsyncMock(
        return_value="0x1234567890abcdef"
    )
    safe_contracts_factory.get_safe_message_hash_for_allocation.return_value = (
        "fedcba9876543210"
    )

    safe_client = MagicMock()
    safe_client.get_message_details = AsyncMock(return_value={"safe": alice.address})

    projects_contracts = MagicMock()
    projects_contracts.get_project_addresses = AsyncMock(
        return_value=["0x16eFF2A933AEa62C6B166BD187f7b705628A7f1e"]
    )

    epoch_contracts = MagicMock()
    epoch_contracts.get_pending_epoch = AsyncMock(return_value=1)

    epoch_subgraph = MagicMock()
    epoch_subgraph.get_epoch_by_number = AsyncMock(
        return_value=EpochDetails(
            epoch_num=1,
            start=0,
            duration=10000,
            decision_window=3000,
            remaining_sec=5000,
        )
    )

    # Override the dependencies
    fast_app.dependency_overrides[
        get_safe_contracts_factory
    ] = lambda: safe_contracts_factory
    fast_app.dependency_overrides[get_safe_client] = lambda: safe_client
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: epoch_subgraph
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: epoch_contracts
    fast_app.dependency_overrides[get_projects_contracts] = lambda: projects_contracts

    allocation_payload = {
        "payload": {
            "allocations": [
                {
                    "proposalAddress": "0x16eFF2A933AEa62C6B166BD187f7b705628A7f1e",
                    "amount": "1000000000000000000",
                }
            ],
            "nonce": 0,
        },
        "isManuallyEdited": False,
    }

    async with fast_client as client:
        resp = await client.post(
            f"multisig-signatures/pending/{alice.address}/type/{SignatureOpType.ALLOCATION}",
            json={"message": allocation_payload},
            headers={"X-Real-IP": "127.0.0.1"},
        )
        print(resp.json())
        assert resp.status_code == HTTPStatus.CREATED

        # Check if the signature was added to the database
        resp = await client.get(
            f"multisig-signatures/pending/{alice.address}/type/{SignatureOpType.ALLOCATION}"
        )
        assert resp.status_code == HTTPStatus.OK
        js = resp.json()
        assert js["hash"] == "fedcba9876543210"
        assert json.loads(js["message"]) == allocation_payload

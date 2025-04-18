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
from v2.crypto.dependencies import get_signed_message_verifier
from v2.allocations.dependencies import get_signature_verifier
from v2.epochs.dependencies import get_epochs_contracts, get_epochs_subgraph
from v2.projects.dependencies import get_projects_contracts
from v2.multisig.dependencies import get_safe_client
from tests.v2.factories import FactoriesAggregator


@pytest.mark.asyncio
async def test_approve_pending_signatures_success_allocation(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return the last pending signature for a valid user and type"""
    # Create a pending epoch snapshot
    alice = await factories.users.get_or_create_alice()

    # Add budget to the user
    await factories.budgets.create(
        user=alice.address,
        epoch=1,
        amount=1000000000000000000,
    )

    # Create a pending snapshot
    await factories.pending_snapshots.create(
        epoch=1,
        locked_ratio=0.01,
    )

    msg = {
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

    # Create a pending signature
    signature = await factories.multisig_signatures.create(
        address=alice.address,
        op_type=SignatureOpType.ALLOCATION,
        message=json.dumps(msg),
        status=SigStatus.PENDING,
    )

    # Mock the safe contracts client
    safe_client = AsyncMock()
    safe_client.get_signature_if_confirmed = AsyncMock(
        return_value="0x1234567890abcdef"
    )

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

    signature_verifier = MagicMock()
    signature_verifier.verify = AsyncMock(return_value=None)

    signed_message_verifier = MagicMock()
    signed_message_verifier.verify = AsyncMock(return_value=True)

    # Override the dependencies
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: epoch_contracts
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: epoch_subgraph
    fast_app.dependency_overrides[get_safe_client] = lambda: safe_client
    fast_app.dependency_overrides[get_projects_contracts] = lambda: projects_contracts
    fast_app.dependency_overrides[get_signature_verifier] = lambda: signature_verifier
    fast_app.dependency_overrides[
        get_signed_message_verifier
    ] = lambda: signed_message_verifier

    # Call the endpoint
    async with fast_client as client:
        # Make sure there's a pending signature
        resp = await client.get(
            f"/multisig-signatures/pending/{alice.address}/type/{SignatureOpType.ALLOCATION}"
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "message": json.dumps(msg),
            "hash": signature.safe_msg_hash,
        }

        # Approve the signature
        resp = await client.patch("/multisig-signatures/pending/approve")
        assert resp.status_code == HTTPStatus.NO_CONTENT

        # Make sure the signature is approved (no pending signatures)
        resp = await client.get(
            f"/multisig-signatures/pending/{alice.address}/type/{SignatureOpType.ALLOCATION}"
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "message": None,
            "hash": None,
        }


@pytest.mark.asyncio
async def test_approve_pending_signatures_success_tos(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return the last pending signature for a valid user and type"""
    # Create a pending epoch snapshot
    alice = await factories.users.get_or_create_alice()

    msg = build_consent_message(alice.address)

    # Create a pending signature
    signature = await factories.multisig_signatures.create(
        address=alice.address,
        op_type=SignatureOpType.TOS,
        message=msg,
        status=SigStatus.PENDING,
    )

    # Mock the safe contracts client
    safe_client = AsyncMock()
    safe_client.get_signature_if_confirmed = AsyncMock(
        return_value="0x1234567890abcdef"
    )

    # Mock the signature verifier
    signature_verifier = MagicMock()
    signature_verifier.verify = AsyncMock(return_value=True)

    # Override the dependencies
    fast_app.dependency_overrides[get_safe_client] = lambda: safe_client
    fast_app.dependency_overrides[get_signature_verifier] = lambda: signature_verifier

    # Call the endpoint
    async with fast_client as client:
        # Make sure there's a pending signature
        resp = await client.get(
            f"/multisig-signatures/pending/{alice.address}/type/{SignatureOpType.TOS}"
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "message": msg,
            "hash": signature.safe_msg_hash,
        }

        # Approve the signature
        resp = await client.patch("/multisig-signatures/pending/approve")
        assert resp.status_code == HTTPStatus.NO_CONTENT

        # Make sure the signature is approved (no pending signatures)
        resp = await client.get(
            f"/multisig-signatures/pending/{alice.address}/type/{SignatureOpType.TOS}"
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "message": None,
            "hash": None,
        }

from http import HTTPStatus
from unittest.mock import AsyncMock
from fastapi import FastAPI
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

from app.modules.common.crypto.signature import EncodingStandardFor, encode_for_signing
from v2.crypto.dependencies import get_signed_message_verifier
from v2.crypto.signatures import _verify_eoa
from tests.v2.fake_contracts.helpers import FakeEpochsContractDetails
from tests.v2.fake_contracts.conftest import FakeEpochsContractCallable
from tests.v2.factories import FactoriesAggregator


@pytest.mark.asyncio
async def test_get_patron_mode_status_not_enabled(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return false for a user who hasn't enabled patron mode"""
    alice = await factories.users.get_or_create_alice()

    async with fast_client as client:
        resp = await client.get(f"user/{alice.address}/patron-mode")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": False}


@pytest.mark.asyncio
async def test_get_patron_mode_status_enabled(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return true for a user who has enabled patron mode"""
    alice = await factories.users.get_or_create_alice()
    await factories.patrons.create(user=alice, patron_mode_enabled=True)

    async with fast_client as client:
        resp = await client.get(f"user/{alice.address}/patron-mode")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": True}


async def mock_call(user_addr, encoded_msg, sig):
    return _verify_eoa(user_addr, encoded_msg, sig)


def mock_verifier():
    mock_verifier = AsyncMock()
    mock_verifier.verify = mock_call
    return mock_verifier


@pytest.mark.asyncio
async def test_patch_patron_mode_enable_success(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
):
    """Should successfully enable patron mode for a user"""
    user, eth_account = await factories.users.create_random_user()

    # mock the signature verifier to return True
    fast_app.dependency_overrides[get_signed_message_verifier] = mock_verifier
    fake_epochs_contract_factory(FakeEpochsContractDetails(pending_epoch=1))

    # Generate valid signature for enabling patron mode
    message = (
        f"Signing this message will enable patron mode for address {user.address}."
    )
    signature = eth_account.sign_message(
        encode_for_signing(EncodingStandardFor.TEXT, message)
    ).signature.hex()

    async with fast_client as client:
        resp = await client.patch(
            f"user/{user.address}/patron-mode",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": True}


@pytest.mark.asyncio
async def test_patch_patron_mode_disable_success(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
):
    """Should successfully disable patron mode for a user"""
    user, eth_account = await factories.users.create_random_user()
    await factories.patrons.create(user=user, patron_mode_enabled=True)

    # mock the signature verifier to return True
    fast_app.dependency_overrides[get_signed_message_verifier] = mock_verifier
    fake_epochs_contract_factory(FakeEpochsContractDetails(pending_epoch=1))

    # Generate valid signature for disabling patron mode
    message = (
        f"Signing this message will disable patron mode for address {user.address}."
    )
    signature = eth_account.sign_message(
        encode_for_signing(EncodingStandardFor.TEXT, message)
    ).signature.hex()

    async with fast_client as client:
        resp = await client.patch(
            f"user/{user.address}/patron-mode",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": False}


@pytest.mark.asyncio
async def test_patch_patron_mode_invalid_signature(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
):
    """Should fail when user provides invalid signature"""
    user, eth_account = await factories.users.create_random_user()

    # mock the signature verifier to return True
    fast_app.dependency_overrides[get_signed_message_verifier] = mock_verifier
    fake_epochs_contract_factory(FakeEpochsContractDetails(pending_epoch=1))

    # Generate invalid signature
    message = (
        f"Signing this message will enable patron mode for address {user.address}."
    )
    signature = eth_account.sign_message(
        encode_for_signing(EncodingStandardFor.TEXT, message)
    ).signature.hex()
    # Make the signature invalid
    if signature.endswith("1234"):
        signature = signature[:-4] + "4321"
    else:
        signature = signature[:-4] + "1234"

    async with fast_client as client:
        resp = await client.patch(
            f"user/{user.address}/patron-mode",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "is invalid" in resp.json()["message"]


@pytest.mark.asyncio
async def test_message_enable_when_already_enabled(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
):
    """Should fail when user provides signature for enabling patron mode when already enabled"""
    user, eth_account = await factories.users.create_random_user()
    await factories.patrons.create(user=user, patron_mode_enabled=True)

    # mock the signature verifier to return True
    fast_app.dependency_overrides[get_signed_message_verifier] = mock_verifier
    fake_epochs_contract_factory(FakeEpochsContractDetails(pending_epoch=1))

    # Generate valid signature for enabling patron mode
    message = (
        f"Signing this message will enable patron mode for address {user.address}."
    )
    invalid_signature = eth_account.sign_message(
        encode_for_signing(EncodingStandardFor.TEXT, message)
    ).signature.hex()

    # Create a new signature with correct message
    message = (
        f"Signing this message will disable patron mode for address {user.address}."
    )
    correct_signature = eth_account.sign_message(
        encode_for_signing(EncodingStandardFor.TEXT, message)
    ).signature.hex()

    async with fast_client as client:
        resp = await client.patch(
            f"user/{user.address}/patron-mode",
            json={"signature": invalid_signature},
        )
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        # We mark this as invalid because the address is already enabled
        assert "is invalid" in resp.json()["message"]

        resp = await client.patch(
            f"user/{user.address}/patron-mode",
            json={"signature": correct_signature},
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": False}


@pytest.mark.asyncio
async def test_patch_patron_mode_wrong_signer(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
):
    """Should fail when user provides signature from wrong signer"""
    alice, eth_account = await factories.users.create_random_user()
    bob, eth_account_bob = await factories.users.create_random_user()

    # mock the signature verifier to return True
    fast_app.dependency_overrides[get_signed_message_verifier] = mock_verifier
    fake_epochs_contract_factory(FakeEpochsContractDetails(pending_epoch=1))

    # Generate signature with alice's account for bob's address
    message = f"Signing this message will enable patron mode for address {bob.address}."
    signature = eth_account.sign_message(
        encode_for_signing(EncodingStandardFor.TEXT, message)
    ).signature.hex()

    async with fast_client as client:
        resp = await client.patch(
            f"user/{bob.address}/patron-mode",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "is invalid" in resp.json()["message"]


@pytest.mark.asyncio
async def test_patch_patron_mode_revokes_allocations(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should revoke allocations when toggling patron mode during allocation window"""
    user, eth_account = await factories.users.create_random_user()

    # Create some allocations for the user
    epoch_number = 1
    await factories.allocations.create(user=user, epoch=epoch_number)
    await factories.allocations.create(user=user, epoch=epoch_number)

    # mock the signature verifier to return True
    fast_app.dependency_overrides[get_signed_message_verifier] = mock_verifier
    fake_epochs_contract_factory(FakeEpochsContractDetails(pending_epoch=epoch_number))

    # Generate valid signature for enabling patron mode
    message = (
        f"Signing this message will enable patron mode for address {user.address}."
    )
    signature = eth_account.sign_message(
        encode_for_signing(EncodingStandardFor.TEXT, message)
    ).signature.hex()

    async with fast_client as client:
        resp = await client.patch(
            f"user/{user.address}/patron-mode",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": True}

        # Verify allocations were revoked
        allocations = await factories.allocations.get_by_user_and_epoch(
            user, epoch_number
        )
        assert len(allocations) == 2
        assert all(allocation.deleted_at is not None for allocation in allocations)


@pytest.mark.asyncio
async def test_patron_mode_full_toggle_cycle(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
):
    """Should successfully toggle patron mode on, off, and back on"""
    user, eth_account = await factories.users.create_random_user()

    # mock the signature verifier to return True
    fast_app.dependency_overrides[get_signed_message_verifier] = mock_verifier
    fake_epochs_contract_factory(FakeEpochsContractDetails(pending_epoch=1))

    async with fast_client as client:
        # Step 0: Check if user is not patron
        resp = await client.get(f"user/{user.address}/patron-mode")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": False}

        # Step 1: Enable patron mode
        message = (
            f"Signing this message will enable patron mode for address {user.address}."
        )
        signature = eth_account.sign_message(
            encode_for_signing(EncodingStandardFor.TEXT, message)
        ).signature.hex()

        resp = await client.patch(
            f"user/{user.address}/patron-mode",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": True}
        await asyncio.sleep(1)  # Wait 1 second after PATCH

        # Verify it's enabled
        resp = await client.get(f"user/{user.address}/patron-mode")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": True}

        # Step 2: Disable patron mode
        message = (
            f"Signing this message will disable patron mode for address {user.address}."
        )
        signature = eth_account.sign_message(
            encode_for_signing(EncodingStandardFor.TEXT, message)
        ).signature.hex()

        resp = await client.patch(
            f"user/{user.address}/patron-mode",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": False}
        await asyncio.sleep(1)  # Wait 1 second after PATCH

        # Verify it's disabled
        resp = await client.get(f"user/{user.address}/patron-mode")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": False}

        # Step 3: Re-enable patron mode
        message = (
            f"Signing this message will enable patron mode for address {user.address}."
        )
        signature = eth_account.sign_message(
            encode_for_signing(EncodingStandardFor.TEXT, message)
        ).signature.hex()

        resp = await client.patch(
            f"user/{user.address}/patron-mode",
            json={"signature": signature},
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": True}
        await asyncio.sleep(1)  # Wait 1 second after PATCH

        # Verify it's enabled again
        resp = await client.get(f"user/{user.address}/patron-mode")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {"status": True}

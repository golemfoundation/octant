from datetime import datetime
from http import HTTPStatus
from unittest.mock import AsyncMock, MagicMock
from fastapi import FastAPI
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


from app.modules.common.crypto.signature import EncodingStandardFor, encode_for_signing
from app.engine.user.effective_deposit import DepositEvent, EventType
from v2.delegations.dependencies import DelegationSettings, get_delegation_settings
from v2.core.dependencies import get_current_timestamp
from v2.deposits.dependencies import (
    GetDepositEventsRepository,
    get_deposit_events_repository,
)
from tests.v2.fake_subgraphs.conftest import FakeEpochsSubgraphCallable
from tests.v2.fake_subgraphs.helpers import FakeEpochEventDetails
from v2.core.types import Address
from v2.uniqueness_quotients.dependencies import get_gitcoin_scorer_client
from v2.uniqueness_quotients.gitcoin_passport import GitcoinPassportScore
from tests.v2.fake_contracts.conftest import FakeEpochsContractCallable
from tests.v2.fake_contracts.helpers import FakeEpochsContractDetails
from tests.v2.users.test_patron_mode import mock_verifier
from v2.crypto.dependencies import get_signed_message_verifier
from tests.v2.factories import FactoriesAggregator


def mock_gitcoin_scorer(score: float):
    async def mock_call(
        user_addr: Address, current_datetime: datetime
    ) -> GitcoinPassportScore:
        return GitcoinPassportScore(
            score=score,
            expires_at=datetime.fromtimestamp(1000000000).replace(tzinfo=None),
            stamps=[],
        )

    mock_gitcoin_scorer = AsyncMock()
    mock_gitcoin_scorer.fetch_score = mock_call
    return mock_gitcoin_scorer


@pytest.mark.asyncio
async def test_delegate_error_low_uq_score(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
):
    # Settings for the delegation
    delegation_settings = DelegationSettings(
        delegation_salt_primary="primary_salt",
        delegation_salt="secondary_salt",
    )
    fast_app.dependency_overrides[get_delegation_settings] = lambda: delegation_settings

    # Mocks
    fast_app.dependency_overrides[get_signed_message_verifier] = mock_verifier
    fake_epochs_contract_factory(FakeEpochsContractDetails(pending_epoch=1))
    fake_epochs_contract_factory(FakeEpochsContractDetails(current_epoch=1))
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=1,
                from_ts=0,
                to_ts=2000,
            )
        ]
    )
    fast_app.dependency_overrides[
        get_gitcoin_scorer_client
    ] = lambda: mock_gitcoin_scorer(0)
    events_repository = MagicMock(spec=GetDepositEventsRepository)
    events_repository.get_all_users_events.return_value = {}
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: events_repository

    _, alice_account = await factories.users.create_random_user()
    _, bob_account = await factories.users.create_random_user()

    msg = (
        f"Delegation of UQ score from {bob_account.address} to {alice_account.address}"
    )
    encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, msg)
    alice_signature = alice_account.sign_message(encoded_msg).signature.hex()
    bob_signature = bob_account.sign_message(encoded_msg).signature.hex()

    async with fast_client as client:
        resp = await client.post(
            "delegation/delegate",
            json={
                "primaryAddr": alice_account.address,
                "secondaryAddr": bob_account.address,
                "primaryAddrSignature": alice_signature,
                "secondaryAddrSignature": bob_signature,
            },
        )

        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "Antisybil score" in resp.json()["message"]


@pytest.mark.asyncio
async def test_delegate_ok(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
):
    # Settings for the delegation
    delegation_settings = DelegationSettings(
        delegation_salt_primary="primary_salt",
        delegation_salt="secondary_salt",
    )
    fast_app.dependency_overrides[get_delegation_settings] = lambda: delegation_settings

    # Mocks
    fast_app.dependency_overrides[get_signed_message_verifier] = mock_verifier
    fake_epochs_contract_factory(FakeEpochsContractDetails(current_epoch=1))
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=1,
                from_ts=0,
                to_ts=2000,
            )
        ]
    )
    fast_app.dependency_overrides[
        get_gitcoin_scorer_client
    ] = lambda: mock_gitcoin_scorer(15.1)
    events_repository = MagicMock(spec=GetDepositEventsRepository)
    events_repository.get_all_users_events.return_value = {}
    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: events_repository

    _, alice_account = await factories.users.create_random_user()
    _, bob_account = await factories.users.create_random_user()

    msg = (
        f"Delegation of UQ score from {bob_account.address} to {alice_account.address}"
    )
    encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, msg)
    alice_signature = alice_account.sign_message(encoded_msg).signature.hex()
    bob_signature = bob_account.sign_message(encoded_msg).signature.hex()

    async with fast_client as client:
        resp = await client.post(
            "delegation/delegate",
            json={
                "primaryAddr": alice_account.address,
                "secondaryAddr": bob_account.address,
                "primaryAddrSignature": alice_signature,
                "secondaryAddrSignature": bob_signature,
            },
        )

        assert resp.status_code == HTTPStatus.CREATED

        # Check that the delegation was created
        resp = await client.get(
            f"delegation/check/{alice_account.address},{bob_account.address}"
        )
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == {
            "primary": alice_account.address,
            "secondary": bob_account.address,
        }

        # Check that repeating will raise an error
        resp = await client.post(
            "delegation/delegate",
            json={
                "primaryAddr": alice_account.address,
                "secondaryAddr": bob_account.address,
                "primaryAddrSignature": alice_signature,
                "secondaryAddrSignature": bob_signature,
            },
        )

        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "Delegation already exists" in resp.json()["message"]


@pytest.mark.asyncio
async def test_delegate_error_locking_address(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fake_epochs_subgraph_factory: FakeEpochsSubgraphCallable,
):
    # Settings for the delegation
    delegation_settings = DelegationSettings(
        delegation_salt_primary="primary_salt",
        delegation_salt="secondary_salt",
    )
    fast_app.dependency_overrides[get_delegation_settings] = lambda: delegation_settings

    alice_user, alice_account = await factories.users.create_random_user()
    bob_user, bob_account = await factories.users.create_random_user()

    # Mocks
    fast_app.dependency_overrides[get_signed_message_verifier] = mock_verifier
    fake_epochs_contract_factory(FakeEpochsContractDetails(current_epoch=1))
    fake_epochs_subgraph_factory(
        [
            FakeEpochEventDetails(
                epoch=1,
                from_ts=0,
                to_ts=2000,
                duration=2000,
            )
        ]
    )
    events_repository = MagicMock(spec=GetDepositEventsRepository)
    events_repository.get_all_users_events.return_value = {
        alice_account.address: [
            DepositEvent(
                user=alice_user,
                type=EventType.LOCK,
                amount=100,
                deposit_before=100 * 10**18 * 2,
                timestamp=0,
            ),
        ]
    }
    fast_app.dependency_overrides[
        get_gitcoin_scorer_client
    ] = lambda: mock_gitcoin_scorer(15.1)

    fast_app.dependency_overrides[
        get_deposit_events_repository
    ] = lambda: events_repository
    fast_app.dependency_overrides[get_current_timestamp] = lambda: 1500

    msg = (
        f"Delegation of UQ score from {bob_account.address} to {alice_account.address}"
    )
    encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, msg)
    alice_signature = alice_account.sign_message(encoded_msg).signature.hex()
    bob_signature = bob_account.sign_message(encoded_msg).signature.hex()

    async with fast_client as client:
        resp = await client.post(
            "delegation/delegate",
            json={
                "primaryAddr": alice_account.address,
                "secondaryAddr": bob_account.address,
                "primaryAddrSignature": alice_signature,
                "secondaryAddrSignature": bob_signature,
            },
        )

        assert resp.status_code == HTTPStatus.BAD_REQUEST
        assert "Secondary address cannot lock any GLMs" in resp.json()["message"]

from __future__ import annotations

import json
from random import randint
from typing import List, Optional
from unittest.mock import MagicMock, Mock

import gql
import pytest
from eth_account import Account
from flask import g as request_context
from flask.testing import FlaskClient
from web3 import Web3

from app import create_app, database
from app.contracts.epochs import Epochs
from app.contracts.erc20 import ERC20
from app.contracts.proposals import Proposals
from app.contracts.vault import Vault
from app.controllers.allocations import allocate, deserialize_payload
from app.core.allocations import AllocationRequest, Allocation
from app.core.rewards.rewards import calculate_matched_rewards
from app.crypto.account import Account as CryptoAccount
from app.crypto.eip712 import sign, build_allocations_eip712_data
from app.extensions import db, w3, deposits, glm
from app.settings import TestConfig, DevConfig
from app.v2.engine.user.effective_deposit import UserDeposit, DepositEvent, EventType
from tests.helpers.constants import (
    MNEMONIC,
    MOCKED_PENDING_EPOCH_NO,
    MOCKED_CURRENT_EPOCH_NO,
    ETH_PROCEEDS,
    TOTAL_ED,
    LOCKED_RATIO,
    TOTAL_REWARDS,
    ALL_INDIVIDUAL_REWARDS,
    USER1_ED,
    USER2_ED,
    USER3_ED,
    USER_MOCKED_BUDGET,
    DEPLOYER_PRIV,
    ALICE,
    BOB,
    CAROL,
    USER1_BUDGET,
    USER2_BUDGET,
    USER3_BUDGET,
    MOCKED_FINALIZED_EPOCH_NO,
    MATCHED_REWARDS,
    USER1_ADDRESS,
    USER2_ADDRESS,
)
from tests.helpers.gql_client import MockGQLClient
from tests.helpers.mocked_epoch_details import EPOCH_EVENTS
from tests.helpers.subgraph.events import create_deposit_event

# Contracts mocks
MOCK_EPOCHS = MagicMock(spec=Epochs)
MOCK_PROPOSALS = MagicMock(spec=Proposals)
MOCK_VAULT = MagicMock(spec=Vault)
MOCK_GLM = MagicMock(spec=ERC20)

# Other mocks
MOCK_GET_ETH_BALANCE = MagicMock()
MOCK_GET_USER_BUDGET = Mock()
MOCK_HAS_PENDING_SNAPSHOT = Mock()
MOCK_LAST_FINALIZED_SNAPSHOT = Mock()
MOCK_EIP1271_IS_VALID_SIGNATURE = Mock()
MOCK_IS_CONTRACT = Mock()
MOCK_MATCHED_REWARDS = MagicMock(spec=calculate_matched_rewards)


def pytest_addoption(parser):
    parser.addoption(
        "--runapi",
        action="store_true",
        default=False,
        help="run api tests; they require chain and indexer running",
    )
    parser.addoption(
        "--onlyapi",
        action="store_true",
        default=False,
        help="run api tests exclusively; they require chain and indexer running",
    )


def pytest_configure(config):
    config.addinivalue_line("markers", "api: mark test as API test")


def pytest_collection_modifyitems(config, items):
    if config.getoption("--runapi"):
        return
    elif config.getoption("--onlyapi"):
        skip_nonapi = pytest.mark.skip(reason="--onlyapi option is on")
        for item in items:
            if "api" not in item.keywords:
                item.add_marker(skip_nonapi)
    else:
        skip_api = pytest.mark.skip(reason="need --runapi option to run")
        for item in items:
            if "api" in item.keywords:
                item.add_marker(skip_api)


@pytest.fixture
def flask_client() -> FlaskClient:
    """An application for the integration / API tests."""
    _app = create_app(DevConfig)

    with _app.test_client() as client:
        with _app.app_context():
            db.create_all()
            yield client
            db.session.close()
            db.drop_all()


class UserAccount:
    def __init__(self, account: CryptoAccount, client: Client):
        self._account = account
        self._client = client

    def fund_octant(self, address: str, value: int):
        signed_txn = w3.eth.account.sign_transaction(
            dict(
                nonce=w3.eth.get_transaction_count(self.address),
                gasPrice=w3.eth.gas_price,
                gas=1000000,
                to=address,
                value=w3.to_wei(value, "ether"),
            ),
            self._account.key,
        )
        w3.eth.send_raw_transaction(signed_txn.rawTransaction)

    def transfer(self, account: "UserAccount", value: int):
        glm.transfer(self._account, account.address, w3.to_wei(value, "ether"))

    def lock(self, value: int):
        glm.approve(self._account, deposits.contract.address, w3.to_wei(value, "ether"))
        deposits.lock(self._account, w3.to_wei(value, "ether"))

    def allocate(self, amount: int, addresses: list[str]):
        nonce = self._client.get_allocation_nonce(self.address)

        payload = {
            "allocations": [
                {
                    "proposalAddress": address,
                    "amount": amount,
                }
                for address in addresses
            ],
            "nonce": nonce,
        }

        signature = sign(self._account, build_allocations_eip712_data(payload))
        self._client.allocate(payload, signature)

    @property
    def address(self):
        return self._account.address


@pytest.fixture
def deployer(client: Client) -> UserAccount:
    return UserAccount(CryptoAccount.from_key(DEPLOYER_PRIV), client)


@pytest.fixture
def ua_alice(client: Client) -> UserAccount:
    return UserAccount(CryptoAccount.from_key(ALICE), client)


@pytest.fixture
def ua_bob(client: Client) -> UserAccount:
    return UserAccount(CryptoAccount.from_key(BOB), client)


@pytest.fixture
def ua_carol(client: Client) -> UserAccount:
    return UserAccount(CryptoAccount.from_key(CAROL), client)


class Client:
    def __init__(self, flask_client: FlaskClient):
        self._flask_client = flask_client

    def root(self):
        return self._flask_client.get("/").text

    def sync_status(self):
        rv = self._flask_client.get("/info/sync-status").text
        return json.loads(rv)

    def pending_snapshot(self):
        rv = self._flask_client.post("/snapshots/pending").text
        return json.loads(rv)

    def get_rewards_budget(self, address: str, epoch: int):
        rv = self._flask_client.get(f"/rewards/budget/{address}/epoch/{epoch}").text
        return json.loads(rv)

    def get_epoch_allocations(self, epoch: int):
        rv = self._flask_client.get(f"/allocations/epoch/{epoch}").text
        return json.loads(rv)

    def get_allocation_nonce(self, address: str) -> int:
        rv = self._flask_client.get(
            f"/allocations/users/{address}/allocation_nonce"
        ).text
        return json.loads(rv)["allocationNonce"]

    def allocate(self, payload: dict, signature: str) -> int:
        rv = self._flask_client.post(
            "/allocations/allocate", json={"payload": payload, "signature": signature}
        )
        assert rv.status_code == 201, rv.text

    @property
    def config(self):
        return self._flask_client.application.config


@pytest.fixture
def client(flask_client: FlaskClient) -> Client:
    return Client(flask_client)


@pytest.fixture(scope="function")
def app():
    """An application for the unit tests."""
    _app = create_app(TestConfig)

    with _app.app_context():
        db.create_all()

    ctx = _app.test_request_context()
    ctx.push()

    yield _app, db

    db.session.close()
    db.drop_all()
    ctx.pop()


@pytest.fixture(scope="function")
def graphql_client(app):
    request_context.graphql_client = gql.Client()


@pytest.fixture(scope="function")
def user_accounts():
    w3.eth.account.enable_unaudited_hdwallet_features()
    return [
        w3.eth.account.from_mnemonic(MNEMONIC, account_path=f"m/44'/60'/0'/0/{i}")
        for i in range(10)
    ]


@pytest.fixture(scope="function")
def tos_users(user_accounts):
    for acc in user_accounts:
        database.user_consents.add_consent(acc.address, "127.0.0.1")
    return user_accounts


@pytest.fixture(scope="function")
def proposal_accounts():
    w3.eth.account.enable_unaudited_hdwallet_features()
    return [
        w3.eth.account.from_mnemonic(MNEMONIC, account_path=f"m/44'/60'/0'/0/{i}")
        for i in range(10, 20)
    ]


@pytest.fixture(scope="function")
def proposal_addresses(proposal_accounts):
    return [p.address for p in proposal_accounts]


@pytest.fixture(scope="function")
def alice(user_accounts):
    return user_accounts[0]


@pytest.fixture(scope="function")
def bob(user_accounts):
    return user_accounts[1]


@pytest.fixture(scope="function")
def carol(user_accounts):
    return user_accounts[2]


@pytest.fixture(scope="function")
def mock_epoch_details(mocker, graphql_client):
    mock_graphql(mocker, epochs_events=list(EPOCH_EVENTS.values()))


@pytest.fixture(scope="function")
def patch_epochs(monkeypatch):
    monkeypatch.setattr("app.controllers.allocations.epochs", MOCK_EPOCHS)
    monkeypatch.setattr("app.controllers.snapshots.epochs", MOCK_EPOCHS)
    monkeypatch.setattr("app.controllers.rewards.epochs", MOCK_EPOCHS)
    monkeypatch.setattr("app.controllers.epochs.epochs", MOCK_EPOCHS)
    monkeypatch.setattr("app.controllers.withdrawals.epochs", MOCK_EPOCHS)
    monkeypatch.setattr("app.core.proposals.epochs", MOCK_EPOCHS)
    monkeypatch.setattr("app.v2.context.epoch_state.epochs", MOCK_EPOCHS)
    monkeypatch.setattr("app.v2.context.epoch_details.epochs", MOCK_EPOCHS)

    MOCK_EPOCHS.get_pending_epoch.return_value = MOCKED_PENDING_EPOCH_NO
    MOCK_EPOCHS.get_current_epoch.return_value = MOCKED_CURRENT_EPOCH_NO
    # props content: from, to, fromTs, duration, decisionWindow
    MOCK_EPOCHS.get_future_epoch_props.return_value = [
        2,
        0,
        1697731200,
        7776000,
        1209600,
    ]


@pytest.fixture(scope="function")
def patch_proposals(monkeypatch, proposal_accounts):
    monkeypatch.setattr("app.core.allocations.proposals", MOCK_PROPOSALS)
    monkeypatch.setattr("app.core.proposals.proposals", MOCK_PROPOSALS)

    MOCK_PROPOSALS.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts
    ]


@pytest.fixture(scope="function")
def patch_glm(monkeypatch):
    monkeypatch.setattr(
        "app.v2.modules.user.deposits.service.impl.contract_balance.glm", MOCK_GLM
    )

    MOCK_GLM.balance_of.return_value = TOTAL_ED


@pytest.fixture(scope="function")
def patch_vault(monkeypatch):
    monkeypatch.setattr("app.controllers.withdrawals.vault", MOCK_VAULT)
    MOCK_VAULT.get_last_claimed_epoch.return_value = 0


@pytest.fixture(scope="function")
def patch_is_contract(monkeypatch):
    monkeypatch.setattr("app.crypto.eth_sign.signature.is_contract", MOCK_IS_CONTRACT)
    MOCK_IS_CONTRACT.return_value = False


@pytest.fixture(scope="function")
def patch_eip1271_is_valid_signature(monkeypatch):
    monkeypatch.setattr(
        "app.crypto.eth_sign.signature.is_valid_signature",
        MOCK_EIP1271_IS_VALID_SIGNATURE,
    )
    MOCK_EIP1271_IS_VALID_SIGNATURE.return_value = True


@pytest.fixture(scope="function")
def patch_eth_get_balance(monkeypatch):
    mock_eth = MagicMock(get_balance=MOCK_GET_ETH_BALANCE)
    mock_web3 = MagicMock(spec=Web3, eth=mock_eth)

    monkeypatch.setattr("app.controllers.snapshots.w3", mock_web3)
    MOCK_GET_ETH_BALANCE.return_value = ETH_PROCEEDS


@pytest.fixture(scope="function")
def patch_has_pending_epoch_snapshot(monkeypatch):
    (
        monkeypatch.setattr(
            "app.core.allocations.has_pending_epoch_snapshot", MOCK_HAS_PENDING_SNAPSHOT
        ),
        monkeypatch.setattr(
            "app.controllers.rewards.has_pending_epoch_snapshot",
            MOCK_HAS_PENDING_SNAPSHOT,
        ),
    )
    MOCK_HAS_PENDING_SNAPSHOT.return_value = True


@pytest.fixture(scope="function")
def patch_last_finalized_snapshot(monkeypatch):
    (
        monkeypatch.setattr(
            "app.controllers.snapshots.get_last_finalized_snapshot",
            MOCK_LAST_FINALIZED_SNAPSHOT,
        ),
    )
    MOCK_LAST_FINALIZED_SNAPSHOT.return_value = 3


@pytest.fixture(scope="function")
def patch_user_budget(monkeypatch):
    monkeypatch.setattr("app.core.allocations.get_budget", MOCK_GET_USER_BUDGET)
    monkeypatch.setattr("app.core.user.rewards.get_budget", MOCK_GET_USER_BUDGET)
    monkeypatch.setattr(
        "app.core.history.user_controller.get_budget", MOCK_GET_USER_BUDGET
    )

    MOCK_GET_USER_BUDGET.return_value = USER_MOCKED_BUDGET


@pytest.fixture(scope="function")
def patch_matched_rewards(monkeypatch):
    monkeypatch.setattr(
        "app.controllers.rewards.get_estimated_matched_rewards", MOCK_MATCHED_REWARDS
    )
    monkeypatch.setattr(
        "app.core.proposals.get_estimated_matched_rewards", MOCK_MATCHED_REWARDS
    )
    MOCK_MATCHED_REWARDS.return_value = 10_000000000_000000000


@pytest.fixture(scope="function")
def mock_pending_epoch_snapshot_db(app, user_accounts):
    database.pending_epoch_snapshot.save_snapshot(
        MOCKED_PENDING_EPOCH_NO,
        ETH_PROCEEDS,
        TOTAL_ED,
        LOCKED_RATIO,
        TOTAL_REWARDS,
        ALL_INDIVIDUAL_REWARDS,
    )
    user1 = database.user.get_or_add_user(user_accounts[0].address)
    user2 = database.user.get_or_add_user(user_accounts[1].address)
    user3 = database.user.get_or_add_user(user_accounts[2].address)
    database.deposits.add(MOCKED_PENDING_EPOCH_NO, user1, USER1_ED, USER1_ED)
    database.deposits.add(MOCKED_PENDING_EPOCH_NO, user2, USER2_ED, USER2_ED)
    database.deposits.add(MOCKED_PENDING_EPOCH_NO, user3, USER3_ED, USER3_ED)
    database.budgets.add(MOCKED_PENDING_EPOCH_NO, user1, USER1_BUDGET)
    database.budgets.add(MOCKED_PENDING_EPOCH_NO, user2, USER2_BUDGET)
    database.budgets.add(MOCKED_PENDING_EPOCH_NO, user3, USER3_BUDGET)

    db.session.commit()


@pytest.fixture(scope="function")
def mock_finalized_epoch_snapshot_db(app, user_accounts):
    database.finalized_epoch_snapshot.add_snapshot(
        MOCKED_FINALIZED_EPOCH_NO, MATCHED_REWARDS
    )

    db.session.commit()


@pytest.fixture(scope="function")
def mock_allocations_db(app, user_accounts, proposal_accounts):
    user1 = database.user.get_or_add_user(user_accounts[0].address)
    user2 = database.user.get_or_add_user(user_accounts[1].address)
    db.session.commit()

    user1_allocations = [
        Allocation(proposal_accounts[0].address, 10 * 10**18),
        Allocation(proposal_accounts[1].address, 5 * 10**18),
        Allocation(proposal_accounts[2].address, 300 * 10**18),
    ]

    user1_allocations_prev_epoch = [
        Allocation(proposal_accounts[0].address, 101 * 10**18),
        Allocation(proposal_accounts[1].address, 51 * 10**18),
        Allocation(proposal_accounts[2].address, 3001 * 10**18),
    ]

    user2_allocations = [
        Allocation(proposal_accounts[1].address, 1050 * 10**18),
        Allocation(proposal_accounts[3].address, 500 * 10**18),
    ]

    user2_allocations_prev_epoch = [
        Allocation(proposal_accounts[1].address, 10501 * 10**18),
        Allocation(proposal_accounts[3].address, 5001 * 10**18),
    ]

    database.allocations.add_all(
        MOCKED_PENDING_EPOCH_NO - 1, user1.id, 0, user1_allocations_prev_epoch
    )
    database.allocations.add_all(
        MOCKED_PENDING_EPOCH_NO - 1, user2.id, 0, user2_allocations_prev_epoch
    )

    database.allocations.add_all(
        MOCKED_PENDING_EPOCH_NO, user1.id, 1, user1_allocations
    )
    database.allocations.add_all(
        MOCKED_PENDING_EPOCH_NO, user2.id, 1, user2_allocations
    )

    db.session.commit()


@pytest.fixture(scope="function")
def mock_user_deposits():
    user_deposits_service_mock = Mock()
    user_deposits_service_mock.get_total_effective_deposit.return_value = TOTAL_ED
    user_deposits_service_mock.get_all_effective_deposits.return_value = (
        [
            UserDeposit(
                USER1_ADDRESS, 270_000000000_000000000, 300_000000000_000000000
            ),
            UserDeposit(
                USER2_ADDRESS, 2790_000000000_000000000, 3100_000000000_000000000
            ),
        ],
        3060_000000000_000000000,
    )

    return user_deposits_service_mock


@pytest.fixture(scope="function")
def mock_events_generator():
    events = [
        DepositEvent(
            user=USER1_ADDRESS,
            type=EventType.LOCK,
            timestamp=1500,
            amount=100_000000000_000000000,
            deposit_before=0,
        )
    ]
    events_generator_mock = Mock()
    events_generator_mock.get_all_users_events.return_value = {USER1_ADDRESS: events}
    events_generator_mock.get_user_events.return_value = events

    return events_generator_mock


@pytest.fixture(scope="function")
def mock_staking_proceeds():
    staking_proceeds_service_mock = Mock()
    staking_proceeds_service_mock.get_staking_proceeds.return_value = ETH_PROCEEDS

    return staking_proceeds_service_mock


def allocate_user_rewards(
    user_account: Account, proposal_account, allocation_amount, nonce: int = 0
):
    payload = create_payload([proposal_account], [allocation_amount], nonce)
    signature = sign(user_account, build_allocations_eip712_data(payload))
    request = AllocationRequest(payload, signature, override_existing_allocations=False)

    allocate(request)


def create_payload(proposals, amounts: Optional[List[int]], nonce: int = 0):
    if amounts is None:
        amounts = [randint(1 * 10**18, 1000 * 10**18) for _ in proposals]

    allocations = [
        {
            "proposalAddress": proposal.address,
            "amount": str(amount),
        }
        for proposal, amount in zip(proposals, amounts)
    ]

    return {"allocations": allocations, "nonce": nonce}


def deserialize_allocations(payload) -> List[Allocation]:
    return deserialize_payload(payload)[1]


def _split_deposit_events(deposit_events):
    deposit_events = deposit_events if deposit_events is not None else []

    locks_events = []
    unlocks_events = []
    timestamp = 1001
    for event in deposit_events:
        event = {"timestamp": timestamp, **event}
        if event["__typename"] == "Locked":
            locks_events.append(create_deposit_event(typename="Locked", **event))
        else:
            unlocks_events.append(create_deposit_event(typename="Unlocked", **event))
        timestamp += 1
    return locks_events, unlocks_events


def mock_graphql(
    mocker,
    deposit_events=None,
    epochs_events=None,
    withdrawals_events=None,
    merkle_roots_events=None,
):
    lockeds, unlockeds = _split_deposit_events(deposit_events)
    # Mock the execute method of the GraphQL client
    mock_client = MockGQLClient(
        epoches=epochs_events,
        lockeds=lockeds,
        unlockeds=unlockeds,
        withdrawals=withdrawals_events,
        merkle_roots=merkle_roots_events,
    )
    mocker.patch.object(request_context.graphql_client, "execute")
    request_context.graphql_client.execute.side_effect = mock_client.execute

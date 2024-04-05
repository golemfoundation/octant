from __future__ import annotations

import json
import os
import time
import urllib.request
from unittest.mock import MagicMock, Mock

import gql
import pytest
from flask import g as request_context
from flask.testing import FlaskClient
from web3 import Web3

from app import create_app
from app.engine.user.effective_deposit import DepositEvent, EventType, UserDeposit
from app.extensions import db, deposits, glm, gql_factory, w3
from app.infrastructure import database
from app.infrastructure.contracts.epochs import Epochs
from app.infrastructure.contracts.erc20 import ERC20
from app.infrastructure.contracts.proposals import Proposals
from app.infrastructure.contracts.vault import Vault
from app.infrastructure.database.multisig_signature import SigStatus
from app.legacy.crypto.account import Account as CryptoAccount
from app.legacy.crypto.eip712 import build_allocations_eip712_data, sign
from app.modules.common.verifier import Verifier
from app.modules.dto import AccountFundsDTO, AllocationItem, SignatureOpType
from app.settings import DevConfig, TestConfig
from tests.helpers import make_user_allocation
from tests.helpers.constants import (
    ALICE,
    BOB,
    CAROL,
    DEPLOYER_PRIV,
    ETH_PROCEEDS,
    LEFTOVER,
    MATCHED_REWARDS,
    MNEMONIC,
    MOCKED_CURRENT_EPOCH_NO,
    MOCKED_FINALIZED_EPOCH_NO,
    MOCKED_PENDING_EPOCH_NO,
    TOTAL_ED,
    TOTAL_WITHDRAWALS,
    USER1_ADDRESS,
    USER1_BUDGET,
    USER2_ADDRESS,
    USER2_BUDGET,
    USER3_BUDGET,
    USER_MOCKED_BUDGET,
    COMMUNITY_FUND,
    PPF,
    MOCKED_EPOCH_NO_AFTER_OVERHAUL,
    MATCHED_REWARDS_AFTER_OVERHAUL,
    NO_PATRONS_REWARDS,
    MULTISIG_APPROVALS_THRESHOLD,
    MULTISIG_MOCKED_MESSAGE,
    MULTISIG_MOCKED_HASH,
)
from tests.helpers.context import get_context
from tests.helpers.gql_client import MockGQLClient
from tests.helpers.mocked_epoch_details import EPOCH_EVENTS
from tests.helpers.octant_rewards import octant_rewards
from tests.helpers.pending_snapshot import create_pending_snapshot
from tests.helpers.signature import create_multisig_signature
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


def mock_etherscan_api_get_transactions(*args, **kwargs):
    if kwargs["tx_type"] == "txlist":
        return [
            {
                "hash": "0x48da2e43af550ff80da0d31340e48a3e32d4e2612ae851b653cc17f859e235dd",
                "to": "0x1234123456123456123456123456123456123456",
                "value": "63731797601781525",
                "isError": "0",
                "functionName": "",
            }
        ]
    elif kwargs["tx_type"] == "txlistinternal":
        return [
            {
                "hash": "0x6281a4a2007cdcce0485b0e7866e69eddcacdf2b6266601046bfc99c2fc288b8",
                "to": "0x1234123456123456123456123456123456123456",
                "value": "3081369209350255",
                "isError": "0",
            }
        ]
    else:
        return [
            {"amount": "1498810", "withdrawalIndex": "11446030"},
        ]


def mock_etherscan_api_get_block_num_from_ts(*args, **kwargs):
    example_resp_json = {"status": "1", "message": "OK", "result": "12712551"}
    return int(example_resp_json["result"])


def mock_bitquery_api_get_blocks_rewards(*args, **kwargs):
    example_resp_json = {
        "data": {
            "ethereum": {
                "blocks": [
                    {
                        "reward": 0.077902794919848902,
                    },
                ]
            }
        }
    }

    return example_resp_json["data"]["ethereum"]["blocks"][0]["reward"]


def mock_safe_api_message_details(*args, **kwargs):
    example_resp_json = {
        "created": "2023-10-27T07:34:09.184140Z",
        "modified": "2023-10-28T20:54:46.207427Z",
        "safe": "0xa40FcB633d0A6c0d27aA9367047635Ff656229B0",
        "messageHash": "0x7f6dfab0a617fcb1c8f351b321a8844d98d9ee160e7532efc39ee06c02308ec6",
        "message": "Welcome to Octant.\nPlease click to sign in and accept the Octant Terms of Service.\n\nSigning this message will not trigger a transaction.\n\nYour address\n0xa40FcB633d0A6c0d27aA9367047635Ff656229B0",
        "proposedBy": "0x5754aC842D6eaF6a4E29101D46ac25D7C567311E",
        "safeAppId": 111,
        "confirmations": [
            {
                "created": "2023-10-27T07:34:09.223358Z",
                "modified": "2023-10-27T07:34:09.223358Z",
                "owner": "0x5754aC842D6eaF6a4E29101D46ac25D7C567311E",
                "signature": "0xa35a1d5689b5daf1003a06479952701bc3574d66fa89c4433c634a864910ddf337b63354a66b11bedb5b6e4f7c0bf1fe2d2797d05dd288fb56e8e5d636a5064c1c",
                "signatureType": "EOA",
            },
            {
                "created": "2023-10-28T08:37:40.741190Z",
                "modified": "2023-10-28T08:37:40.741190Z",
                "owner": "0xa35E7b6524d312B7FABefd00F9A8e4524581Dc85",
                "signature": "0xa966dd0a074f4891a286b115adc191469bc19fe07105468ca582bd82c952165529a452e93ddbb062859bd2fd4c6efd68808a5e3444053ddd5e46244bb300c6fd1f",
                "signatureType": "ETH_SIGN",
            },
            {
                "created": "2023-10-28T20:54:46.207427Z",
                "modified": "2023-10-28T20:54:46.207427Z",
                "owner": "0x4280Ce44aFAb1e5E940574F135802E12ad2A5eF0",
                "signature": "0x1d2ca05dbfda9d996aacf47b78f5ee6f477171c3895fe0bd496f68b33f68059463539264dffb513c4bf7857aaa646c170f3a47189a61ae9734d3724503c560f220",
                "signatureType": "ETH_SIGN",
            },
        ],
        "preparedSignature": "0x1c2ca05dbfda9d996aacf47b78f5ee6f477171c3895fe0bd496f68b33f68059463539264dffb513c4bf7857aaa646c170f3a47189a61ae9734d3724503c560f220a37a1d5689b5daf1003a06479952701bc3574d66fa89c4433c634a864910ddf337b63354a66b11bedb5b6e4f7c0bf1fe2d2797d05dd288fb56e8e5d636a5064c1ca966dd0a074f4891a286b115adc191469bc19fe07105468ca582bd82c952165529a452e93ddbb062859bd2fd4c6efd68808a5e3444053ddd5e46244bb300c6fd1f",
    }
    return example_resp_json


def mock_safe_api_user_details(*args, **kwargs):
    example_resp_json = {
        "address": "0x89d2EcE5ca5cee0672d8BaD68cC7638D30Dc005e",
        "nonce": 0,
        "threshold": MULTISIG_APPROVALS_THRESHOLD,
        "owners": [
            "0x94F9B0F7B5d00e33f5DEaBBf780e2E6D870E9714",
            "0x6c1865c85C1ebd545FD891Aa38dE993c485aE90a",
        ],
        "masterCopy": "0xfb1bffC9d739B8D520DaF37dF666da4C687191EA",
        "modules": [],
        "fallbackHandler": "0x017062a1dE2FE6b99BE3d9d37841FeD19F573804",
        "guard": "0x0000000000000000000000000000000000000000",
        "version": "1.3.0+L2",
    }
    return example_resp_json


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


def setup_deployment() -> dict[str, str]:
    deployer = os.getenv("CONTRACTS_DEPLOYER_URL")
    testname = f"octant_test_{random_string()}"
    f = urllib.request.urlopen(f"{deployer}/?name={testname}")
    deployment = f.read().decode().split("\n")
    deployment = {var.split("=")[0]: var.split("=")[1] for var in deployment}
    return deployment


def random_string() -> str:
    import random
    import string

    length_of_string = 6
    characters = string.ascii_letters + string.digits
    return "".join(random.choices(characters, k=length_of_string))


@pytest.fixture
def flask_client(deployment) -> FlaskClient:
    """An application for the integration / API tests."""
    _app = create_app(deployment)

    with _app.test_client() as client:
        with _app.app_context():
            db.create_all()
            yield client
            db.session.close()
            db.drop_all()


@pytest.fixture(scope="function")
def deployment(pytestconfig):
    """
    Deploy contracts and a subgraph under a single-use name.
    """
    envs = setup_deployment()
    graph_name = envs["SUBGRAPH_NAME"]
    conf = DevConfig
    graph_url = os.environ["SUBGRAPH_URL"]
    conf.SUBGRAPH_ENDPOINT = f"{graph_url}/subgraphs/name/{graph_name}"
    conf.GLM_CONTRACT_ADDRESS = envs["GLM_CONTRACT_ADDRESS"]
    conf.DEPOSITS_CONTRACT_ADDRESS = envs["DEPOSITS_CONTRACT_ADDRESS"]
    conf.EPOCHS_CONTRACT_ADDRESS = envs["EPOCHS_CONTRACT_ADDRESS"]
    conf.PROPOSALS_CONTRACT_ADDRESS = envs["PROPOSALS_CONTRACT_ADDRESS"]
    conf.WITHDRAWALS_TARGET_CONTRACT_ADDRESS = envs[
        "WITHDRAWALS_TARGET_CONTRACT_ADDRESS"
    ]
    conf.VAULT_CONTRACT_ADDRESS = envs["VAULT_CONTRACT_ADDRESS"]
    yield conf


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

    def transfer(self, account: UserAccount, value: int):
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
        self._client.allocate(payload, self._account.address, signature)

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

    def wait_for_sync(self, target):
        while True:
            res = self.sync_status()
            if res["indexedEpoch"] == res["blockchainEpoch"]:
                if res["indexedEpoch"] == target:
                    return
            time.sleep(0.5)

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

    def allocate(self, payload: dict, user_address: str, signature: str) -> int:
        rv = self._flask_client.post(
            "/allocations/allocate",
            json={
                "payload": payload,
                "userAddress": user_address,
                "signature": signature,
            },
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
def context():
    return get_context()


@pytest.fixture(scope="function")
def projects(context):
    return context.projects_details.projects


@pytest.fixture(scope="function")
def mock_epoch_details(mocker, graphql_client):
    mock_graphql(mocker, epochs_events=list(EPOCH_EVENTS.values()))


@pytest.fixture(scope="function")
def patch_epochs(monkeypatch):
    monkeypatch.setattr("app.legacy.controllers.snapshots.epochs", MOCK_EPOCHS)
    monkeypatch.setattr("app.legacy.core.proposals.epochs", MOCK_EPOCHS)
    monkeypatch.setattr("app.context.epoch_state.epochs", MOCK_EPOCHS)
    monkeypatch.setattr("app.context.epoch_details.epochs", MOCK_EPOCHS)

    MOCK_EPOCHS.get_pending_epoch.return_value = MOCKED_PENDING_EPOCH_NO
    MOCK_EPOCHS.get_current_epoch.return_value = MOCKED_CURRENT_EPOCH_NO
    MOCK_EPOCHS.get_finalized_epoch.return_value = MOCKED_FINALIZED_EPOCH_NO

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
    monkeypatch.setattr("app.legacy.core.proposals.proposals", MOCK_PROPOSALS)
    monkeypatch.setattr("app.context.projects.proposals", MOCK_PROPOSALS)

    MOCK_PROPOSALS.get_proposal_addresses.return_value = [
        p.address for p in proposal_accounts
    ]


@pytest.fixture(scope="function")
def patch_glm(monkeypatch):
    monkeypatch.setattr(
        "app.modules.user.deposits.service.contract_balance.glm", MOCK_GLM
    )

    MOCK_GLM.balance_of.return_value = TOTAL_ED


@pytest.fixture(scope="function")
def patch_vault(monkeypatch):
    monkeypatch.setattr("app.modules.withdrawals.service.pending.vault", MOCK_VAULT)
    monkeypatch.setattr("app.modules.withdrawals.service.finalized.vault", MOCK_VAULT)
    MOCK_VAULT.get_last_claimed_epoch.return_value = 0


@pytest.fixture(scope="function")
def patch_is_contract(monkeypatch):
    monkeypatch.setattr(
        "app.legacy.crypto.eth_sign.signature.is_contract", MOCK_IS_CONTRACT
    )
    monkeypatch.setattr("app.modules.common.signature.is_contract", MOCK_IS_CONTRACT)
    MOCK_IS_CONTRACT.return_value = False


@pytest.fixture(scope="function")
def patch_eip1271_is_valid_signature(monkeypatch):
    monkeypatch.setattr(
        "app.modules.common.signature.is_valid_signature",
        MOCK_EIP1271_IS_VALID_SIGNATURE,
    )
    MOCK_EIP1271_IS_VALID_SIGNATURE.return_value = True


@pytest.fixture(scope="function")
def patch_eth_get_balance(monkeypatch):
    mock_eth = MagicMock(get_balance=MOCK_GET_ETH_BALANCE)
    mock_web3 = MagicMock(spec=Web3, eth=mock_eth)

    monkeypatch.setattr(
        "app.modules.staking.proceeds.service.contract_balance.w3", mock_web3
    )
    MOCK_GET_ETH_BALANCE.return_value = ETH_PROCEEDS


@pytest.fixture(scope="function")
def patch_has_pending_epoch_snapshot(monkeypatch):
    (
        monkeypatch.setattr(
            "app.context.epoch_state._has_pending_epoch_snapshot",
            MOCK_HAS_PENDING_SNAPSHOT,
        )
    )
    (
        monkeypatch.setattr(
            "app.context.epoch_state._has_pending_epoch_snapshot",
            MOCK_HAS_PENDING_SNAPSHOT,
        )
    )
    MOCK_HAS_PENDING_SNAPSHOT.return_value = True


@pytest.fixture(scope="function")
def patch_last_finalized_snapshot(monkeypatch):
    (
        monkeypatch.setattr(
            "app.legacy.controllers.snapshots.get_last_finalized_snapshot",
            MOCK_LAST_FINALIZED_SNAPSHOT,
        ),
    )
    MOCK_LAST_FINALIZED_SNAPSHOT.return_value = 3


@pytest.fixture(scope="function")
def patch_user_budget(monkeypatch):
    monkeypatch.setattr(
        "app.modules.user.budgets.service.saved.SavedUserBudgets.get_budget",
        MOCK_GET_USER_BUDGET,
    )
    MOCK_GET_USER_BUDGET.return_value = USER_MOCKED_BUDGET


@pytest.fixture(scope="function")
def patch_etherscan_transactions_api(monkeypatch):
    monkeypatch.setattr(
        "app.modules.staking.proceeds.service.aggregated.get_transactions",
        mock_etherscan_api_get_transactions,
    )


@pytest.fixture(scope="function")
def patch_etherscan_get_block_api(monkeypatch):
    monkeypatch.setattr(
        "app.context.epoch_details.get_block_num_from_ts",
        mock_etherscan_api_get_block_num_from_ts,
    )


@pytest.fixture(scope="function")
def patch_bitquery_get_blocks_rewards(monkeypatch):
    monkeypatch.setattr(
        "app.modules.staking.proceeds.service.aggregated.get_blocks_rewards",
        mock_bitquery_api_get_blocks_rewards,
    )


@pytest.fixture(scope="function")
def patch_safe_api_message_details(monkeypatch):
    monkeypatch.setattr(
        "app.modules.multisig_signatures.service.offchain.get_message_details",
        mock_safe_api_message_details,
    )


@pytest.fixture(scope="function")
def patch_safe_api_user_details(monkeypatch):
    monkeypatch.setattr(
        "app.modules.multisig_signatures.service.offchain.get_user_details",
        mock_safe_api_user_details,
    )


@pytest.fixture(scope="function")
def mock_users_db(app, user_accounts):
    alice = database.user.add_user(user_accounts[0].address)
    bob = database.user.add_user(user_accounts[1].address)
    carol = database.user.add_user(user_accounts[2].address)
    db.session.commit()

    return alice, bob, carol


@pytest.fixture(scope="function")
def mock_pending_epoch_snapshot_db_since_epoch3(
    app, mock_users_db, ppf=PPF, cf=COMMUNITY_FUND
):
    create_pending_snapshot(
        epoch_nr=MOCKED_EPOCH_NO_AFTER_OVERHAUL,
        mock_users_db=mock_users_db,
        optional_ppf=ppf,
        optional_cf=cf,
    )


@pytest.fixture(scope="function")
def mock_pending_epoch_snapshot_db(app, mock_users_db):
    create_pending_snapshot(
        epoch_nr=MOCKED_PENDING_EPOCH_NO, mock_users_db=mock_users_db
    )


@pytest.fixture(scope="function")
def mock_finalized_epoch_snapshot_db_since_epoch3(app, user_accounts):
    database.finalized_epoch_snapshot.save_snapshot(
        MOCKED_EPOCH_NO_AFTER_OVERHAUL,
        MATCHED_REWARDS_AFTER_OVERHAUL,
        NO_PATRONS_REWARDS,
        LEFTOVER,
        total_withdrawals=TOTAL_WITHDRAWALS,
    )

    db.session.commit()


@pytest.fixture(scope="function")
def mock_finalized_epoch_snapshot_db(app, user_accounts):
    database.finalized_epoch_snapshot.save_snapshot(
        MOCKED_FINALIZED_EPOCH_NO,
        MATCHED_REWARDS,
        NO_PATRONS_REWARDS,
        LEFTOVER,
        total_withdrawals=TOTAL_WITHDRAWALS,
    )

    db.session.commit()


@pytest.fixture(scope="function")
def mock_allocations_db(app, mock_users_db, proposal_accounts):
    prev_epoch_context = get_context(MOCKED_PENDING_EPOCH_NO - 1)
    pending_epoch_context = get_context(MOCKED_PENDING_EPOCH_NO)
    user1, user2, _ = mock_users_db

    user1_allocations = [
        AllocationItem(proposal_accounts[0].address, 10 * 10**18),
        AllocationItem(proposal_accounts[1].address, 5 * 10**18),
        AllocationItem(proposal_accounts[2].address, 300 * 10**18),
    ]

    user1_allocations_prev_epoch = [
        AllocationItem(proposal_accounts[0].address, 101 * 10**18),
        AllocationItem(proposal_accounts[1].address, 51 * 10**18),
        AllocationItem(proposal_accounts[2].address, 3001 * 10**18),
    ]

    user2_allocations = [
        AllocationItem(proposal_accounts[1].address, 1050 * 10**18),
        AllocationItem(proposal_accounts[3].address, 500 * 10**18),
    ]

    user2_allocations_prev_epoch = [
        AllocationItem(proposal_accounts[1].address, 10501 * 10**18),
        AllocationItem(proposal_accounts[3].address, 5001 * 10**18),
    ]

    make_user_allocation(
        prev_epoch_context,
        user1,
        nonce=0,
        allocation_items=user1_allocations_prev_epoch,
    )
    make_user_allocation(
        prev_epoch_context,
        user2,
        nonce=0,
        allocation_items=user2_allocations_prev_epoch,
    )

    make_user_allocation(
        pending_epoch_context, user1, nonce=1, allocation_items=user1_allocations
    )
    make_user_allocation(
        pending_epoch_context, user2, nonce=1, allocation_items=user2_allocations
    )

    db.session.commit()


@pytest.fixture(scope="function")
def mock_pending_multisig_signatures(alice):
    create_multisig_signature(
        alice.address,
        MULTISIG_MOCKED_MESSAGE,
        MULTISIG_MOCKED_HASH,
        SignatureOpType.TOS,
        "0.0.0.0",
        SigStatus.PENDING,
    )
    create_multisig_signature(
        alice.address,
        MULTISIG_MOCKED_MESSAGE,
        MULTISIG_MOCKED_HASH,
        SignatureOpType.ALLOCATION,
        "0.0.0.0",
        SigStatus.PENDING,
    )


@pytest.fixture(scope="function")
def mock_approved_multisig_signatures(alice):
    create_multisig_signature(
        alice.address,
        MULTISIG_MOCKED_MESSAGE,
        MULTISIG_MOCKED_HASH,
        SignatureOpType.ALLOCATION,
        "0.0.0.0",
        SigStatus.APPROVED,
    )
    create_multisig_signature(
        alice.address,
        MULTISIG_MOCKED_MESSAGE,
        MULTISIG_MOCKED_HASH,
        SignatureOpType.TOS,
        "0.0.0.0",
        SigStatus.APPROVED,
    )


@pytest.fixture(scope="function")
def mock_pending_allocation_signature(alice):
    create_multisig_signature(
        alice.address,
        MULTISIG_MOCKED_MESSAGE,
        MULTISIG_MOCKED_HASH,
        SignatureOpType.ALLOCATION,
        "0.0.0.0",
        SigStatus.PENDING,
    )


@pytest.fixture(scope="function")
def mock_pending_tos_signature(alice):
    create_multisig_signature(
        alice.address,
        MULTISIG_MOCKED_MESSAGE,
        MULTISIG_MOCKED_HASH,
        SignatureOpType.TOS,
        "0.0.0.0",
        SigStatus.PENDING,
    )


@pytest.fixture(scope="function")
def mock_octant_rewards():
    octant_rewards_service_mock = Mock()
    octant_rewards_service_mock.get_octant_rewards.return_value = octant_rewards()
    octant_rewards_service_mock.get_matched_rewards.return_value = MATCHED_REWARDS

    return octant_rewards_service_mock


@pytest.fixture(scope="function")
def mock_staking_proceeds():
    staking_proceeds_service_mock = Mock()
    staking_proceeds_service_mock.get_staking_proceeds.return_value = ETH_PROCEEDS

    return staking_proceeds_service_mock


@pytest.fixture(scope="function")
def mock_verifier():
    verifier_mock = Mock(Verifier)
    verifier_mock.verify_logic.return_value = True
    verifier_mock.verify_signature.return_value = True

    return verifier_mock


@pytest.fixture(scope="function")
def mock_user_nonce():
    user_nonce_service_mock = Mock()
    user_nonce_service_mock.get_next_user_nonce.return_value = 0

    return user_nonce_service_mock


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
def mock_user_budgets(alice, bob, carol):
    user_budgets_service_mock = Mock()
    user_budgets_service_mock.get_all_budgets.return_value = {
        alice.address: USER1_BUDGET,
        bob.address: USER2_BUDGET,
        carol.address: USER3_BUDGET,
    }

    return user_budgets_service_mock


@pytest.fixture(scope="function")
def mock_user_allocations(alice):
    user_allocations_service_mock = Mock()
    user_allocations_service_mock.get_all_donors_addresses.return_value = [
        alice.address
    ]

    return user_allocations_service_mock


@pytest.fixture(scope="function")
def mock_patron_mode(bob):
    patron_mode_service_mock = Mock()
    patron_mode_service_mock.get_all_patrons_addresses.return_value = [bob.address]
    patron_mode_service_mock.get_patrons_rewards.return_value = USER2_BUDGET

    return patron_mode_service_mock


@pytest.fixture(scope="function")
def mock_withdrawals():
    withdrawals_service_mock = Mock()
    return withdrawals_service_mock


@pytest.fixture(scope="function")
def mock_user_rewards(alice, bob):
    user_rewards_service_mock = Mock()
    user_rewards_service_mock.get_claimed_rewards.return_value = (
        [
            AccountFundsDTO(alice.address, 100_000000000),
            AccountFundsDTO(bob.address, 200_000000000),
        ],
        300_000000000,
    )

    return user_rewards_service_mock


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
    mocker.patch.object(gql_factory, "build")
    gql_factory.build.return_value = mock_client

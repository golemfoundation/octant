from __future__ import annotations

import datetime
from http import HTTPStatus
import json
import logging
import os
import time
import urllib.error
import urllib.request
from unittest.mock import MagicMock, Mock

import gql
import pytest
from flask import current_app
from flask import g as request_context
from flask.testing import FlaskClient
from gql.transport.exceptions import TransportQueryError
from requests import RequestException
from web3 import Web3

from app import create_app
from app.engine.user.effective_deposit import DepositEvent, EventType, UserDeposit
from app.exceptions import ExternalApiException
from app.extensions import db, deposits, glm, gql_factory, w3, vault, epochs
from app.infrastructure import Client as GQLClient
from app.infrastructure import database
from app.infrastructure.contracts.epochs import Epochs
from app.infrastructure.contracts.erc20 import ERC20
from app.infrastructure.contracts.projects import Projects
from app.infrastructure.contracts.vault import Vault
from app.infrastructure.database.multisig_signature import SigStatus
from app.legacy.crypto.account import Account as CryptoAccount
from app.legacy.crypto.eip712 import build_allocations_eip712_data, sign
from app.modules.common.verifier import Verifier
from app.modules.dto import AccountFundsDTO, AllocationItem, SignatureOpType
from app.settings import DevConfig, TestConfig
from tests.helpers import make_user_allocation
from tests.helpers.constants import (
    STARTING_EPOCH,
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
    MOCKED_EPOCH_NO_AFTER_OVERHAUL,
    MATCHED_REWARDS_AFTER_OVERHAUL,
    NO_PATRONS_REWARDS,
    MULTISIG_APPROVALS_THRESHOLD,
    MULTISIG_MOCKED_MESSAGE,
    MULTISIG_MOCKED_HASH,
    MULTISIG_MOCKED_SAFE_HASH,
    MULTISIG_ADDRESS,
    PPF,
    MAX_UQ_SCORE,
    LOW_UQ_SCORE,
)
from tests.helpers.context import get_context
from tests.helpers.gql_client import MockGQLClient
from tests.helpers.mocked_epoch_details import EPOCH_EVENTS
from tests.helpers.octant_rewards import octant_rewards
from tests.helpers.pending_snapshot import create_pending_snapshot
from tests.helpers.signature import create_multisig_signature
from tests.helpers.subgraph.events import create_deposit_event

LOGGER = logging.getLogger("app")

# Contracts mocks
MOCK_EPOCHS = MagicMock(spec=Epochs)
MOCK_PROJECTS = MagicMock(spec=Projects)
MOCK_VAULT = MagicMock(spec=Vault)
MOCK_GLM = MagicMock(spec=ERC20)

# Other mocks
MOCK_GET_ETH_BALANCE = MagicMock()
MOCK_GET_USER_BUDGET = Mock()
MOCK_HAS_PENDING_SNAPSHOT = Mock()
MOCK_LAST_FINALIZED_SNAPSHOT = Mock()
MOCK_EIP1271_IS_VALID_SIGNATURE = Mock()
MOCK_GET_MESSAGE_HASH = Mock()
MOCK_IS_CONTRACT = Mock()


def mock_gitcoin_passport_issue_address_for_scoring(*args, **kwargs):
    if args[0] == "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266":
        return {
            "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "score": "2.572",
            "status": "DONE",
            "last_score_timestamp": "2024-05-22T14:46:46.810800+00:00",
            "evidence": None,
            "error": None,
            "stamp_scores": {
                "twitterAccountAgeGte#730": 0.0,
                "githubAccountCreationGte#365": 0.0,
                "Google": 0.525,
                "Linkedin": 1.531,
                "Discord": 0.516,
                "githubAccountCreationGte#180": 0.0,
                "twitterAccountAgeGte#365": 0.0,
                "twitterAccountAgeGte#180": 0.0,
                "githubAccountCreationGte#90": 0.0,
            },
        }
    elif args[0] == "0xBc6d82D8d6632938394905Bb0217Ad9c673015d1":
        return {
            "address": "0xBc6d82D8d6632938394905Bb0217Ad9c673015d1",
            "score": "22.0",
            "status": "DONE",
        }
    else:
        return {"status": "DONE", "score": "0.0"}


def mock_gitcoin_passport_fetch_score(*args, **kwargs):
    if args[0] == "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266":
        return {
            "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "score": "2.572",
            "status": "DONE",
            "last_score_timestamp": "2024-05-22T14:46:46.810800+00:00",
            "evidence": None,
            "error": None,
            "stamp_scores": {
                "twitterAccountAgeGte#730": 0.0,
                "githubAccountCreationGte#365": 0.0,
                "Google": 0.525,
                "Linkedin": 1.531,
                "Discord": 0.516,
                "githubAccountCreationGte#180": 0.0,
                "twitterAccountAgeGte#365": 0.0,
                "twitterAccountAgeGte#180": 0.0,
                "githubAccountCreationGte#90": 0.0,
            },
        }
    elif args[0] == "0xBc6d82D8d6632938394905Bb0217Ad9c673015d1":
        return {
            "address": "0xBc6d82D8d6632938394905Bb0217Ad9c673015d1",
            "score": "22.0",
            "status": "DONE",
        }
    else:
        return {"status": "DONE", "score": "0.0"}


def mock_gitcoin_passport_fetch_stamps(*args, **kwargs):
    if args[0] == "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266":
        return {
            "next": None,
            "prev": None,
            "items": [
                {
                    "version": "1.0.0",
                    "credential": {
                        "type": ["VerifiableCredential"],
                        "proof": {
                            "type": "EthereumEip712Signature2021",
                            "created": "2024-03-12T14:28:53.877Z",
                            "@context": "https://w3id.org/security/suites/eip712sig-2021/v1",
                            "proofValue": "0x5ef4c6d9ff1116c66d45c5bc65cf83ed1220b6faa4b6f78d8f057bb88470be8d4622f7bc8846accdd1057413c42408dbcce5cd4e55362fc6ac581b2f9536ec2c1b",
                            "eip712Domain": {
                                "types": {
                                    "Proof": [
                                        {"name": "@context", "type": "string"},
                                        {"name": "created", "type": "string"},
                                        {"name": "proofPurpose", "type": "string"},
                                        {"name": "type", "type": "string"},
                                        {
                                            "name": "verificationMethod",
                                            "type": "string",
                                        },
                                    ],
                                    "@context": [
                                        {"name": "hash", "type": "string"},
                                        {"name": "provider", "type": "string"},
                                    ],
                                    "Document": [
                                        {"name": "@context", "type": "string[]"},
                                        {
                                            "name": "credentialSubject",
                                            "type": "CredentialSubject",
                                        },
                                        {"name": "expirationDate", "type": "string"},
                                        {"name": "issuanceDate", "type": "string"},
                                        {"name": "issuer", "type": "string"},
                                        {"name": "proof", "type": "Proof"},
                                        {"name": "type", "type": "string[]"},
                                    ],
                                    "EIP712Domain": [
                                        {"name": "name", "type": "string"}
                                    ],
                                    "CredentialSubject": [
                                        {"name": "@context", "type": "@context"},
                                        {"name": "hash", "type": "string"},
                                        {"name": "id", "type": "string"},
                                        {"name": "provider", "type": "string"},
                                    ],
                                },
                                "domain": {"name": "VerifiableCredential"},
                                "primaryType": "Document",
                            },
                            "proofPurpose": "assertionMethod",
                            "verificationMethod": "did:ethr:0xd6f8d6ca86aa01e551a311d670a0d1bd8577e5fb#controller",
                        },
                        "issuer": "did:ethr:0xd6f8d6ca86aa01e551a311d670a0d1bd8577e5fb",
                        "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://w3id.org/vc/status-list/2021/v1",
                        ],
                        "issuanceDate": "2024-03-12T14:28:53.876Z",
                        "expirationDate": "2090-01-01T00:00:00.000Z",
                        "credentialSubject": {
                            "id": "did:pkh:eip155:1:0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                            "hash": "v0.0.0:pQzBR3arZrlQXpJ6KRGxKEjhR03DyQ05ois9EmRNrAQ=",
                            "@context": {
                                "hash": "https://schema.org/Text",
                                "provider": "https://schema.org/Text",
                            },
                            "provider": "Linkedin",
                        },
                    },
                },
                {
                    "version": "1.0.0",
                    "credential": {
                        "type": ["VerifiableCredential"],
                        "proof": {
                            "type": "EthereumEip712Signature2021",
                            "created": "2024-03-12T14:24:07.018Z",
                            "@context": "https://w3id.org/security/suites/eip712sig-2021/v1",
                            "proofValue": "0x2547250aca7112a8488eb45a62dfabc8f5f6e4ecc1bf24f8e28839ce1ff7e786496cf5eb5ffb9eaa27bbcf58ecd66bc966d20844b7b5a7666d4fbbc38f609b641c",
                            "eip712Domain": {
                                "types": {
                                    "Proof": [
                                        {"name": "@context", "type": "string"},
                                        {"name": "created", "type": "string"},
                                        {"name": "proofPurpose", "type": "string"},
                                        {"name": "type", "type": "string"},
                                        {
                                            "name": "verificationMethod",
                                            "type": "string",
                                        },
                                    ],
                                    "@context": [
                                        {"name": "hash", "type": "string"},
                                        {"name": "provider", "type": "string"},
                                    ],
                                    "Document": [
                                        {"name": "@context", "type": "string[]"},
                                        {
                                            "name": "credentialSubject",
                                            "type": "CredentialSubject",
                                        },
                                        {"name": "expirationDate", "type": "string"},
                                        {"name": "issuanceDate", "type": "string"},
                                        {"name": "issuer", "type": "string"},
                                        {"name": "proof", "type": "Proof"},
                                        {"name": "type", "type": "string[]"},
                                    ],
                                    "EIP712Domain": [
                                        {"name": "name", "type": "string"}
                                    ],
                                    "CredentialSubject": [
                                        {"name": "@context", "type": "@context"},
                                        {"name": "hash", "type": "string"},
                                        {"name": "id", "type": "string"},
                                        {"name": "provider", "type": "string"},
                                    ],
                                },
                                "domain": {"name": "VerifiableCredential"},
                                "primaryType": "Document",
                            },
                            "proofPurpose": "assertionMethod",
                            "verificationMethod": "did:ethr:0xd6f8d6ca86aa01e551a311d670a0d1bd8577e5fb#controller",
                        },
                        "issuer": "did:ethr:0xd6f8d6ca86aa01e551a311d670a0d1bd8577e5fb",
                        "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://w3id.org/vc/status-list/2021/v1",
                        ],
                        "issuanceDate": "2024-03-12T14:24:07.018Z",
                        "expirationDate": "2099-01-01T00:00:00.000Z",
                        "credentialSubject": {
                            "id": "did:pkh:eip155:1:0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                            "hash": "v0.0.0:PM/AuRacZWQ3McP8Dr6Ux+yb8PcVjeS7rlVcc6ry/2Q=",
                            "@context": {
                                "hash": "https://schema.org/Text",
                                "provider": "https://schema.org/Text",
                            },
                            "provider": "Discord",
                        },
                    },
                },
                {
                    "version": "1.0.0",
                    "credential": {
                        "type": ["VerifiableCredential"],
                        "proof": {
                            "type": "EthereumEip712Signature2021",
                            "created": "2024-03-12T14:24:07.018Z",
                            "@context": "https://w3id.org/security/suites/eip712sig-2021/v1",
                            "proofValue": "0x2547250aca7112a8488eb45a62dfabc8f5f6e4ecc1bf24f8e28839ce1ff7e786496cf5eb5ffb9eaa27bbcf58ecd66bc966d20844b7b5a7666d4fbbc38f609b641c",
                            "eip712Domain": {
                                "types": {
                                    "Proof": [
                                        {"name": "@context", "type": "string"},
                                        {"name": "created", "type": "string"},
                                        {"name": "proofPurpose", "type": "string"},
                                        {"name": "type", "type": "string"},
                                        {
                                            "name": "verificationMethod",
                                            "type": "string",
                                        },
                                    ],
                                    "@context": [
                                        {"name": "hash", "type": "string"},
                                        {"name": "provider", "type": "string"},
                                    ],
                                    "Document": [
                                        {"name": "@context", "type": "string[]"},
                                        {
                                            "name": "credentialSubject",
                                            "type": "CredentialSubject",
                                        },
                                        {"name": "expirationDate", "type": "string"},
                                        {"name": "issuanceDate", "type": "string"},
                                        {"name": "issuer", "type": "string"},
                                        {"name": "proof", "type": "Proof"},
                                        {"name": "type", "type": "string[]"},
                                    ],
                                    "EIP712Domain": [
                                        {"name": "name", "type": "string"}
                                    ],
                                    "CredentialSubject": [
                                        {"name": "@context", "type": "@context"},
                                        {"name": "hash", "type": "string"},
                                        {"name": "id", "type": "string"},
                                        {"name": "provider", "type": "string"},
                                    ],
                                },
                                "domain": {"name": "VerifiableCredential"},
                                "primaryType": "Document",
                            },
                            "proofPurpose": "assertionMethod",
                            "verificationMethod": "did:ethr:0xd6f8d6ca86aa01e551a311d670a0d1bd8577e5fb#controller",
                        },
                        "issuer": "did:ethr:0xd6f8d6ca86aa01e551a311d670a0d1bd8577e5fb",
                        "@context": [
                            "https://www.w3.org/2018/credentials/v1",
                            "https://w3id.org/vc/status-list/2021/v1",
                        ],
                        "issuanceDate": "2024-03-12T14:24:07.018Z",
                        "expirationDate": "2024-06-10T14:24:07.018Z",
                        "credentialSubject": {
                            "id": "did:pkh:eip155:1:0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                            "hash": "v0.0.0:PM/AuRacZWQ3McP8Dr6Ux+yb8PcVjeS7rlVcc6ry/2Q=",
                            "@context": {
                                "hash": "https://schema.org/Text",
                                "provider": "https://schema.org/Text",
                            },
                            "provider": "Discord",
                        },
                    },
                },
            ],
        }

    elif args[0] == "0xBc6d82D8d6632938394905Bb0217Ad9c673015d1":
        return {
            "items": [
                {
                    "version": "1.0.0",
                    "credential": {
                        "expirationDate": "2099-09-22T15:04:05.073Z",
                        "credentialSubject": {"provider": "AllowList#OctantEpochTwo"},
                    },
                }
            ]
        }
    else:
        return {"next": None, "prev": None, "items": []}


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
        "safe": MULTISIG_ADDRESS,
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


def setup_deployment(test_name: str) -> dict[str, str]:
    deployer = os.getenv("CONTRACTS_DEPLOYER_URL")
    env_name = f"octant_test_{random_string()}"
    LOGGER.debug(f"test {test_name}, environment name: {env_name}")
    try:
        f = urllib.request.urlopen(f"{deployer}/?name={env_name}")
        time.sleep(10)
        deployment = f.read().decode().split("\n")
        deployment = {var.split("=")[0]: var.split("=")[1] for var in deployment}
        return deployment
    except urllib.error.HTTPError as err:
        LOGGER.debug(f"call to multideployer failed: {err}")
        LOGGER.debug(f"multideployer failed: code is {err.code}")
        LOGGER.debug(f"multideployer failed: msg is {err.msg}")
        raise err


def teardown_deployment(test_name, subgraph_name):
    deployer = os.getenv("CONTRACTS_DEPLOYER_URL")
    LOGGER.debug(
        f"calling multideployer to teardown env {subgraph_name} for test {test_name}"
    )
    urllib.request.urlopen(f"{deployer}/remove?name={subgraph_name}")


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
def deployment(pytestconfig, request):
    """
    Deploy contracts and a subgraph under a single-use name.
    """
    envs = setup_deployment(request.node.name)
    graph_name = envs["SUBGRAPH_NAME"]
    conf = DevConfig
    graph_url = os.environ["SUBGRAPH_URL"]
    conf.SUBGRAPH_ENDPOINT = f"{graph_url}/subgraphs/name/{graph_name}"
    conf.SUBGRAPH_RETRY_TIMEOUT_SEC = 10
    conf.GLM_CONTRACT_ADDRESS = envs["GLM_CONTRACT_ADDRESS"]
    conf.DEPOSITS_CONTRACT_ADDRESS = envs["DEPOSITS_CONTRACT_ADDRESS"]
    conf.EPOCHS_CONTRACT_ADDRESS = envs["EPOCHS_CONTRACT_ADDRESS"]
    conf.PROJECTS_CONTRACT_ADDRESS = envs["PROPOSALS_CONTRACT_ADDRESS"]
    conf.WITHDRAWALS_TARGET_CONTRACT_ADDRESS = envs[
        "WITHDRAWALS_TARGET_CONTRACT_ADDRESS"
    ]
    conf.VAULT_CONTRACT_ADDRESS = envs["VAULT_CONTRACT_ADDRESS"]
    conf.SCHEDULER_ENABLED = False
    conf.VAULT_CONFIRM_WITHDRAWALS_ENABLED = False
    conf.TESTNET_MULTISIG_PRIVATE_KEY = (
        "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e"
    )
    yield conf
    teardown_deployment(request.node.name, graph_name)


class UserAccount:
    def __init__(self, account: CryptoAccount, client: Client):
        self._account = account
        self._client = client

    def fund_octant(self):
        signed_txn = w3.eth.account.sign_transaction(
            dict(
                nonce=w3.eth.get_transaction_count(self.address),
                gasPrice=w3.eth.gas_price,
                gas=1000000,
                to=self._client.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"],
                value=w3.to_wei(400, "ether"),
            ),
            self._account.key,
        )
        w3.eth.send_raw_transaction(signed_txn.rawTransaction)

    def transfer(self, account: UserAccount, value: int):
        glm.transfer(self._account, account.address, w3.to_wei(value, "ether"))

    def lock(self, value: int):
        glm.approve(self._account, deposits.contract.address, w3.to_wei(value, "ether"))
        deposits.lock(self._account, w3.to_wei(value, "ether"))

    def unlock(self, value: int):
        glm.approve(self._account, deposits.contract.address, w3.to_wei(value, "ether"))
        deposits.unlock(self._account, w3.to_wei(value, "ether"))

    def withdraw(self, epoch: int, amount: int, merkle_proof: dict):
        vault.batch_withdraw(self._account, epoch, amount, merkle_proof)

    def allocate(self, amount: int, addresses: list[str]):
        nonce, _ = self._client.get_allocation_nonce(self.address)
        return self._client.make_allocation(self._account, amount, addresses, nonce)

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


@pytest.fixture
def setup_funds(
    client: Client,
    deployer: UserAccount,
    ua_alice: UserAccount,
    ua_bob: UserAccount,
    ua_carol: UserAccount,
    request,
):
    test_name = request.node.name
    current_app.logger.debug(f"RUNNING TEST: {test_name}")
    current_app.logger.debug("Setup funds before test")

    # fund Octant
    deployer.fund_octant()
    # fund Users
    deployer.transfer(ua_alice, 10000)
    deployer.transfer(ua_bob, 15000)
    deployer.transfer(ua_carol, 20000)


class Client:
    def __init__(self, flask_client: FlaskClient):
        self._flask_client = flask_client

    def root(self):
        return self._flask_client.get("/").text

    def sync_status(self):
        rv = self._flask_client.get("/info/sync-status")
        return json.loads(rv.text), rv.status_code

    def wait_for_sync(self, target, timeout_s=20, check_interval=0.5):
        timeout = datetime.timedelta(seconds=timeout_s)
        start = datetime.datetime.now()
        while True:
            res = {}
            try:
                res, status_code = self.sync_status()
                current_app.logger.debug(f"sync_status returns {res}")
                current_app.logger.debug(
                    f"sync_status http status code is {status_code}"
                )
                assert status_code == HTTPStatus.OK
            except Exception as exp:
                current_app.logger.warning(
                    f"Request to /info/sync-status returned {exp}"
                )
                if datetime.datetime.now() - start > timeout:
                    raise TimeoutError(
                        f"Waiting for sync for epoch {target} has timeouted ({timeout_s} sec)"
                    )
                time.sleep(check_interval)
                continue

            if res["indexedEpoch"] == res["blockchainEpoch"]:
                if res["indexedEpoch"] == target:
                    return

    def wait_for_height_sync(self):
        while True:
            res, _ = self.sync_status()
            if res["indexedHeight"] == res["blockchainHeight"]:
                return res["indexedHeight"]
            time.sleep(0.5)

    def move_to_next_epoch(self, target):
        assert epochs.get_current_epoch() == target - 1
        now = w3.eth.get_block("latest").timestamp
        nextEpochAt = epochs.get_current_epoch_end()
        forward = nextEpochAt - now + 30
        w3.provider.make_request("evm_increaseTime", [forward])
        w3.provider.make_request("evm_mine", [])
        assert epochs.get_current_epoch() == target

    def snapshot_status(self, epoch):
        rv = self._flask_client.get(f"/snapshots/status/{epoch}")
        return json.loads(rv.text), rv.status_code

    def pending_snapshot(self):
        rv = self._flask_client.post("/snapshots/pending").text
        return json.loads(rv)

    def pending_snapshot_simulate(self):
        rv = self._flask_client.get("/snapshots/pending/simulate")
        return json.loads(rv.text), rv.status_code

    def finalized_snapshot(self):
        rv = self._flask_client.post("/snapshots/finalized").text
        return json.loads(rv)

    def finalized_snapshot_simulate(self):
        rv = self._flask_client.get("/snapshots/finalized/simulate")
        return json.loads(rv.text), rv.status_code

    def get_projects(self, epoch: int):
        rv = self._flask_client.get(f"/projects/epoch/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_current_epoch(self):
        rv = self._flask_client.get("/epochs/current")
        return json.loads(rv.text), rv.status_code

    def get_indexed_epoch(self):
        rv = self._flask_client.get("/epochs/indexed")
        return json.loads(rv.text), rv.status_code

    def get_epoch_info(self, epoch):
        rv = self._flask_client.get(f"/epochs/info/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_total_effective_estimated(self):
        rv = self._flask_client.get("/deposits/total_effective/estimated")
        return json.loads(rv.text), rv.status_code

    def get_total_effective(self, epoch: int):
        rv = self._flask_client.get(f"/deposits/{epoch}/total_effective")
        return json.loads(rv.text), rv.status_code

    def get_user_deposit(self, user_address: str, epoch: int):
        rv = self._flask_client.get(f"/deposits/users/{user_address}/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_user_estimated_effective_deposit(self, user_address: str):
        rv = self._flask_client.get(
            f"/deposits/users/{user_address}/estimated_effective_deposit"
        )
        return json.loads(rv.text), rv.status_code

    def get_locked_ratio_in_epoch(self, epoch: int):
        rv = self._flask_client.get(f"/deposits/{epoch}/locked_ratio")
        return json.loads(rv.text), rv.status_code

    def get_rewards_budget(self, address: str, epoch: int):
        rv = self._flask_client.get(f"/rewards/budget/{address}/epoch/{epoch}")
        return json.loads(rv.text)

    def get_withdrawals_for_address(self, address: str):
        rv = self._flask_client.get(f"/withdrawals/{address}").text
        return json.loads(rv)

    def get_epoch_allocations(self, epoch: int):
        rv = self._flask_client.get(f"/allocations/epoch/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_allocation_nonce(self, address: str) -> tuple[int, int]:
        rv = self._flask_client.get(f"/allocations/users/{address}/allocation_nonce")
        return json.loads(rv.text)["allocationNonce"], rv.status_code

    def make_allocation(
        self, account, amount: int, addresses: list[str], nonce: int
    ) -> int:
        signature = self.sign_operation(account, amount, addresses, nonce)
        rv = self._flask_client.post(
            "/allocations/allocate",
            json={
                "payload": {
                    "allocations": [
                        {"proposalAddress": address, "amount": amount}
                        for address in addresses
                    ],
                    "nonce": nonce,
                },
                "userAddress": account.address,
                "signature": signature,
            },
        )
        return rv.status_code

    def sign_operation(self, account, amount, addresses, nonce) -> str:
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
        signature = sign(account, build_allocations_eip712_data(payload))
        return signature

    def get_donors(self, epoch) -> tuple[dict, int]:
        rv = self._flask_client.get(f"/allocations/donors/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_proposal_donors(self, epoch, proposal_address) -> tuple[dict, int]:
        rv = self._flask_client.get(
            f"/allocations/project/{proposal_address}/epoch/{epoch}"
        )
        return json.loads(rv.text), rv.status_code

    def get_user_allocations(self, epoch, user_address) -> tuple[dict, int]:
        rv = self._flask_client.get(f"/allocations/user/{user_address}/epoch/{epoch}")
        return json.loads(rv.text), rv.status_code

    def check_leverage(
        self, proposal_address, user_address, amount
    ) -> tuple[dict, int]:
        payload = {
            "allocations": [{"proposalAddress": proposal_address, "amount": amount}]
        }
        rv = self._flask_client.post(
            f"/allocations/leverage/{user_address}", json=payload
        )
        return json.loads(rv.text), rv.status_code

    def get_epoch_patrons(self, epoch) -> tuple[dict, int]:
        rv = self._flask_client.get(f"/user/patrons/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_patron_mode_status(self, user_address) -> tuple[dict, int]:
        rv = self._flask_client.get(f"/user/{user_address}/patron-mode")
        return json.loads(rv.text), rv.status_code

    def patch_patron(self, user_address, signature):
        rv = self._flask_client.patch(
            f"/user/{user_address}/patron-mode",
            json={"signature": signature},
        )
        return json.loads(rv.text), rv.status_code

    def get_user_tos_status(self, user_address) -> tuple[dict, int]:
        rv = self._flask_client.get(f"/user/{user_address}/tos")
        return json.loads(rv.text), rv.status_code

    def accept_tos(self, user_address, signature):
        rv = self._flask_client.post(
            f"/user/{user_address}/tos",
            json={"signature": signature},
        )
        return json.loads(rv.text), rv.status_code

    def get_user_history(self, user_address: str) -> tuple[dict, int]:
        rv = self._flask_client.get(f"/history/{user_address}")
        return json.loads(rv.text), rv.status_code

    def get_user_uq(self, user_address: str, epoch: int) -> tuple[dict, int]:
        rv = self._flask_client.get(f"/user/{user_address}/uq/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_all_uqs(self, epoch: int) -> tuple[dict, int]:
        rv = self._flask_client.get(f"user/uq/{epoch}/all")
        return json.loads(rv.text), rv.status_code

    def get_antisybil_score(self, user_address: str) -> (any, int):
        rv = self._flask_client.get(f"/user/{user_address}/antisybil-status")
        return json.loads(rv.text), rv.status_code

    def refresh_antisybil_score(self, user_address: str) -> (str | None, int):
        rv = self._flask_client.put(f"/user/{user_address}/antisybil-status")
        return rv.text, rv.status_code

    def get_chain_info(self) -> tuple[dict, int]:
        rv = self._flask_client.get("/info/chain-info")
        return json.loads(rv.text), rv.status_code

    def get_version(self) -> tuple[dict, int]:
        rv = self._flask_client.get("/info/version")
        return json.loads(rv.text), rv.status_code

    def get_healthcheck(self) -> tuple[dict, int]:
        rv = self._flask_client.get("/info/healthcheck")
        return json.loads(rv.text), rv.status_code

    def check_delegation(self, *addresses) -> tuple[dict, int]:
        addresses = ",".join(addresses)
        rv = self._flask_client.get(f"/delegation/check/{addresses}")
        return json.loads(rv.text), rv.status_code

    def delegate(
        self,
        primary_address: str,
        secondary_address: str,
        primary_address_signature: str,
        secondary_address_signature: str,
    ) -> tuple[dict, int]:
        rv = self._flask_client.post(
            "/delegation/delegate",
            json={
                "primaryAddr": primary_address,
                "secondaryAddr": secondary_address,
                "primaryAddrSignature": primary_address_signature,
                "secondaryAddrSignature": secondary_address_signature,
            },
        )
        return json.loads(rv.text), rv.status_code

    @property
    def config(self):
        return self._flask_client.application.config


@pytest.fixture
def client(flask_client: FlaskClient) -> Client:
    client = Client(flask_client)
    for i in range(1, STARTING_EPOCH + 1):
        if i != 1:
            client.move_to_next_epoch(i)
        client.wait_for_sync(i, timeout_s=60)
    return client


@pytest.fixture(scope="function")
def app():
    """An application for the unit tests."""
    _app = create_app(TestConfig)

    with _app.app_context():
        db.session.close()
        db.drop_all()

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
def project_accounts():
    w3.eth.account.enable_unaudited_hdwallet_features()
    return [
        w3.eth.account.from_mnemonic(MNEMONIC, account_path=f"m/44'/60'/0'/0/{i}")
        for i in range(10, 20)
    ]


@pytest.fixture(scope="function")
def project_addresses(project_accounts):
    return [p.address for p in project_accounts]


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
    monkeypatch.setattr("app.legacy.core.projects.epochs", MOCK_EPOCHS)
    monkeypatch.setattr("app.context.epoch_state.epochs", MOCK_EPOCHS)
    monkeypatch.setattr("app.context.epoch.factory.epochs", MOCK_EPOCHS)

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
def patch_projects(monkeypatch, project_accounts):
    monkeypatch.setattr("app.legacy.core.projects.projects", MOCK_PROJECTS)
    monkeypatch.setattr("app.context.projects.projects_extension", MOCK_PROJECTS)
    monkeypatch.setattr(
        "app.modules.projects.metadata.service.projects_metadata.projects",
        MOCK_PROJECTS,
    )

    MOCK_PROJECTS.get_project_addresses.return_value = [
        p.address for p in project_accounts
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
    monkeypatch.setattr(
        "app.modules.common.crypto.signature.is_contract", MOCK_IS_CONTRACT
    )
    MOCK_IS_CONTRACT.return_value = False


@pytest.fixture(scope="function")
def patch_eip1271_is_valid_signature(monkeypatch):
    monkeypatch.setattr(
        "app.modules.common.crypto.signature.is_valid_signature",
        MOCK_EIP1271_IS_VALID_SIGNATURE,
    )
    MOCK_EIP1271_IS_VALID_SIGNATURE.return_value = True


@pytest.fixture(scope="function")
def patch_get_message_hash(monkeypatch):
    monkeypatch.setattr(
        "app.modules.multisig_signatures.service.offchain.get_message_hash",
        MOCK_GET_MESSAGE_HASH,
    )
    MOCK_GET_MESSAGE_HASH.return_value = (
        "0xc995b1c20cdd79e48a0696bb36f645925c45ef5f8c75ea49974b1ebb556351ca"
    )


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
    monkeypatch.setattr(
        "app.legacy.controllers.snapshots.get_last_finalized_snapshot",
        MOCK_LAST_FINALIZED_SNAPSHOT,
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
def patch_gitcoin_passport_issue_address_for_scoring(monkeypatch):
    monkeypatch.setattr(
        "app.modules.user.antisybil.service.initial.issue_address_for_scoring",
        mock_gitcoin_passport_issue_address_for_scoring,
    )


@pytest.fixture(scope="function")
def patch_gitcoin_passport_fetch_score(monkeypatch):
    monkeypatch.setattr(
        "app.modules.user.antisybil.service.initial.fetch_score",
        mock_gitcoin_passport_fetch_score,
    )


@pytest.fixture(scope="function")
def patch_gitcoin_passport_fetch_stamps(monkeypatch):
    monkeypatch.setattr(
        "app.modules.user.antisybil.service.initial.fetch_stamps",
        mock_gitcoin_passport_fetch_stamps,
    )


@pytest.fixture(scope="function")
def patch_etherscan_transactions_api(monkeypatch):
    monkeypatch.setattr(
        "app.modules.staking.proceeds.service.aggregated.get_transactions",
        mock_etherscan_api_get_transactions,
    )


@pytest.fixture(scope="function")
def patch_etherscan_get_block_api(monkeypatch):
    monkeypatch.setattr(
        "app.context.epoch.block_range.get_block_num_from_ts",
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
    monkeypatch.setattr(
        "app.modules.multisig_signatures.core.get_message_details",
        mock_safe_api_message_details,
    )


@pytest.fixture(scope="function")
def patch_safe_api_message_details_for_404_error(monkeypatch):
    def mock_404_error(*args, **kwargs):
        raise ExternalApiException(RequestException(), 404)

    monkeypatch.setattr(
        "app.modules.multisig_signatures.service.offchain.get_message_details",
        mock_404_error,
    )
    monkeypatch.setattr(
        "app.infrastructure.external_api.common.time.sleep",
        lambda x: None,
    )


@pytest.fixture(scope="function")
def patch_safe_api_user_details(monkeypatch):
    monkeypatch.setattr(
        "app.modules.multisig_signatures.core.get_user_details",
        mock_safe_api_user_details,
    )


@pytest.fixture(scope="function")
def mock_users_db_with_scores(app, user_accounts):
    alice = database.user.add_user(user_accounts[0].address)
    bob = database.user.add_user(user_accounts[1].address)
    carol = database.user.add_user(user_accounts[2].address)

    db.session.commit()

    database.uniqueness_quotient.save_uq(alice, 4, LOW_UQ_SCORE)
    database.uniqueness_quotient.save_uq(bob, 4, MAX_UQ_SCORE)
    database.uniqueness_quotient.save_uq(carol, 4, LOW_UQ_SCORE)

    return alice, bob, carol


@pytest.fixture(scope="function")
def mock_users_db(app, user_accounts):
    alice = database.user.add_user(user_accounts[0].address)
    bob = database.user.add_user(user_accounts[1].address)
    carol = database.user.add_user(user_accounts[2].address)
    db.session.commit()

    return alice, bob, carol


@pytest.fixture(scope="function")
def mock_pending_epoch_snapshot_db_since_epoch3(
    app,
    mock_users_db,
    ppf=PPF,
    cf=COMMUNITY_FUND,
    epoch=MOCKED_EPOCH_NO_AFTER_OVERHAUL,
):
    create_pending_snapshot(
        epoch_nr=epoch,
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
def mock_allocations_db(mock_users_db, project_accounts, epoch=MOCKED_PENDING_EPOCH_NO):
    prev_epoch_context = get_context(epoch - 1)
    pending_epoch_context = get_context(epoch)
    user1, user2, _ = mock_users_db

    user1_allocations = [
        AllocationItem(project_accounts[0].address, 10 * 10**18),
        AllocationItem(project_accounts[1].address, 5 * 10**18),
        AllocationItem(project_accounts[2].address, 300 * 10**18),
    ]

    user1_allocations_prev_epoch = [
        AllocationItem(project_accounts[0].address, 101 * 10**18),
        AllocationItem(project_accounts[1].address, 51 * 10**18),
        AllocationItem(project_accounts[2].address, 3001 * 10**18),
    ]

    user2_allocations = [
        AllocationItem(project_accounts[1].address, 1050 * 10**18),
        AllocationItem(project_accounts[3].address, 500 * 10**18),
    ]

    user2_allocations_prev_epoch = [
        AllocationItem(project_accounts[1].address, 10501 * 10**18),
        AllocationItem(project_accounts[3].address, 5001 * 10**18),
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
        MULTISIG_MOCKED_SAFE_HASH,
        SignatureOpType.TOS,
        "0.0.0.0",
        SigStatus.PENDING,
    )
    create_multisig_signature(
        alice.address,
        MULTISIG_MOCKED_MESSAGE,
        MULTISIG_MOCKED_HASH,
        MULTISIG_MOCKED_SAFE_HASH,
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
        MULTISIG_MOCKED_SAFE_HASH,
        SignatureOpType.ALLOCATION,
        "0.0.0.0",
        SigStatus.APPROVED,
    )
    create_multisig_signature(
        alice.address,
        MULTISIG_MOCKED_MESSAGE,
        MULTISIG_MOCKED_HASH,
        MULTISIG_MOCKED_SAFE_HASH,
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
        MULTISIG_MOCKED_SAFE_HASH,
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
        MULTISIG_MOCKED_SAFE_HASH,
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
def mock_empty_events_generator():
    events_generator_mock = Mock()
    events_generator_mock.get_all_users_events.return_value = {}
    events_generator_mock.get_user_events.return_value = []
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
    user_budgets_service_mock.get_budget.return_value = USER1_BUDGET

    return user_budgets_service_mock


@pytest.fixture(scope="function")
def mock_user_allocations(alice):
    user_allocations_service_mock = Mock()
    user_allocations_service_mock.get_all_donors_addresses.return_value = [
        alice.address
    ]

    return user_allocations_service_mock


@pytest.fixture(scope="function")
def mock_user_allocation_nonce():
    user_allocation_nonce_mock = Mock()
    user_allocation_nonce_mock.get_user_next_nonce.return_value = 0

    return user_allocation_nonce_mock


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


@pytest.fixture(scope="function")
def mock_failing_gql(
    app,
    mocker,
    monkeypatch,
):
    # this URL is not called in this test, but it needs to be a proper URL
    gql_factory.set_url({"SUBGRAPH_ENDPOINT": "http://domain.example:12345"})

    mocker.patch.object(GQLClient, "execute_sync")
    GQLClient.execute_sync.side_effect = TransportQueryError(
        "the chain was reorganized while executing the query"
    )

    # Return increments of 0.5 second for each call
    start_time = datetime.datetime(2021, 1, 1, 0, 0, 0)
    time_changes = (
        start_time + datetime.timedelta(seconds=0.5 * i) for i in range(10000)
    )

    class mydatetime(datetime.datetime):
        @classmethod
        def now(cls):
            return next(time_changes)

    monkeypatch.setattr(datetime, "datetime", mydatetime)

    mocker.patch.object(time, "sleep")


@pytest.fixture(scope="function")
def mock_uniqueness_quotients():
    uniqueness_quotients = Mock()
    uniqueness_quotients.calculate.return_value = LOW_UQ_SCORE

    return uniqueness_quotients

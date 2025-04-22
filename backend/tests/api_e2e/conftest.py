import datetime
import time
import logging
from eth_account import Account
import pytest
import json
from http import HTTPStatus
from fastapi.testclient import TestClient

from app.extensions import (
    deposits,
    glm,
    w3,
    vault,
)

from app.modules.dto import ScoreDelegationPayload
from v2.core.dependencies import get_w3, get_web3_provider_settings
from v2.epochs.dependencies import get_epochs_contracts, get_epochs_settings
from tests.helpers.constants import (
    ALICE,
    BOB,
    CAROL,
    DEPLOYER_PRIV,
    USER1_ADDRESS,
    USER2_ADDRESS,
)
from unittest.mock import patch

logger = logging.getLogger(__name__)


class FastAPIClient:
    def __init__(self, fastapi_client: TestClient):
        self._fastapi_client = fastapi_client

    def root(self):
        return self._fastapi_client.get("/").text

    def sync_status(self):
        rv = self._fastapi_client.get("/info/sync-status")
        return json.loads(rv.text), rv.status_code

    def wait_for_sync(self, target, timeout_s=20, check_interval=0.5):
        timeout = datetime.timedelta(seconds=timeout_s)
        start = datetime.datetime.now()
        while True:
            try:
                res, status_code = self.sync_status()
                logger.debug(f"sync_status returns {res}")
                logger.debug(f"sync_status http status code is {status_code}")
                assert status_code == HTTPStatus.OK
            except Exception as exp:
                logger.warning(f"Request to /info/sync-status returned {exp}")
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

    async def move_to_next_epoch(self, target):
        w3 = get_w3(get_web3_provider_settings())
        epochs = get_epochs_contracts(w3, get_epochs_settings())

        current_epoch = await epochs.get_current_epoch()
        assert current_epoch == target - 1

        latest_block = await w3.eth.get_block("latest")
        now = latest_block.timestamp

        next_epoch_at = await epochs.get_current_epoch_end()
        forward = next_epoch_at - now + 30
        await w3.provider.make_request("evm_increaseTime", [forward])
        await w3.provider.make_request("evm_mine", [])

        current_epoch = await epochs.get_current_epoch()
        assert current_epoch == target

        logger.info(f"Moved to epoch {target}")

    def snapshot_status(self, epoch):
        rv = self._fastapi_client.get(f"/snapshots/status/{epoch}")
        return json.loads(rv.text), rv.status_code

    def pending_snapshot(self):
        rv = self._fastapi_client.post("/snapshots/pending")
        logger.info(f"pending_snapshot returns {rv.text}")
        return json.loads(rv.text)

    def pending_snapshot_simulate(self):
        rv = self._fastapi_client.get("/snapshots/pending/simulate")
        return json.loads(rv.text), rv.status_code

    def finalized_snapshot(self):
        rv = self._fastapi_client.post("/snapshots/finalized").text
        return json.loads(rv)

    def finalized_snapshot_simulate(self):
        rv = self._fastapi_client.get("/snapshots/finalized/simulate")
        return json.loads(rv.text), rv.status_code

    def get_projects(self, epoch: int):
        rv = self._fastapi_client.get(f"/projects/epoch/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_current_epoch(self):
        rv = self._fastapi_client.get("/epochs/current")
        return json.loads(rv.text), rv.status_code

    def get_indexed_epoch(self):
        rv = self._fastapi_client.get("/epochs/indexed")
        return json.loads(rv.text), rv.status_code

    def get_epoch_info(self, epoch):
        rv = self._fastapi_client.get(f"/epochs/info/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_total_effective_estimated(self):
        rv = self._fastapi_client.get("/deposits/total_effective/estimated")
        return json.loads(rv.text), rv.status_code

    def get_total_effective(self, epoch: int):
        rv = self._fastapi_client.get(f"/deposits/{epoch}/total_effective")
        return json.loads(rv.text), rv.status_code

    def get_user_deposit(self, user_address: str, epoch: int):
        rv = self._fastapi_client.get(f"/deposits/users/{user_address}/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_user_estimated_effective_deposit(self, user_address: str):
        rv = self._fastapi_client.get(
            f"/deposits/users/{user_address}/estimated_effective_deposit"
        )
        return json.loads(rv.text), rv.status_code

    def get_locked_ratio_in_epoch(self, epoch: int):
        rv = self._fastapi_client.get(f"/deposits/{epoch}/locked_ratio")
        return json.loads(rv.text), rv.status_code

    def get_rewards_budget(self, address: str, epoch: int):
        rv = self._fastapi_client.get(f"/rewards/budget/{address}/epoch/{epoch}")
        return json.loads(rv.text)

    def get_user_rewards_in_upcoming_epoch(self, address: str):
        rv = self._fastapi_client.get(f"/rewards/budget/{address}/upcoming")
        return json.loads(rv.text)

    def get_user_rewards_in_epoch(self, address: str, epoch: int):
        rv = self._fastapi_client.get(f"/rewards/budget/{address}/epoch/{epoch}")
        return json.loads(rv.text)

    def get_total_users_rewards_in_epoch(self, epoch):
        rv = self._fastapi_client.get(f"/rewards/budgets/epoch/{epoch}")
        return json.loads(rv.text)

    def get_estimated_budget_by_days(self, number_of_days, amount):
        rv = self._fastapi_client.post(
            "/rewards/estimated_budget/by_days",
            json={"days": number_of_days, "glmAmount": amount},
        )
        return json.loads(rv.text)

    def get_estimated_budget_by_epochs(self, number_of_epochs, amount):
        rv = self._fastapi_client.post(
            "/rewards/estimated_budget",
            json={"numberOfEpochs": number_of_epochs, "glmAmount": amount},
        )
        return json.loads(rv.text)

    def get_rewards_leverage(self, epoch):
        rv = self._fastapi_client.get(f"/rewards/leverage/{epoch}")
        return json.loads(rv.text)

    def get_rewards_merkle_tree(self, epoch):
        rv = self._fastapi_client.get(f"/rewards/merkle_tree/{epoch}")
        return json.loads(rv.text)

    def get_projects_with_matched_rewards_in_epoch(self, epoch):
        rv = self._fastapi_client.get(f"/rewards/projects/epoch/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_estimated_projects_rewards(self):
        rv = self._fastapi_client.get("/rewards/projects/estimated")
        return json.loads(rv.text)

    def get_proposals_treshold_in_epoch(self, epoch) -> tuple[dict, int]:
        rv = self._fastapi_client.get(f"/rewards/threshold/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_unused_rewards(self, epoch):
        rv = self._fastapi_client.get(f"/rewards/unused/{epoch}")
        return json.loads(rv.text)

    def get_withdrawals_for_address(self, address: str):
        rv = self._fastapi_client.get(f"/withdrawals/{address}").text
        return json.loads(rv)

    def get_epoch_allocations(self, epoch: int):
        rv = self._fastapi_client.get(f"/allocations/epoch/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_allocation_nonce(self, address: str) -> tuple[int, int]:
        rv = self._fastapi_client.get(f"/allocations/users/{address}/allocation_nonce")
        return json.loads(rv.text)["allocationNonce"], rv.status_code

    def make_allocation(
        self, account, amount: int, addresses: list[str], nonce: int
    ) -> int:
        signature = self.sign_operation(account, amount, addresses, nonce)
        rv = self._fastapi_client.post(
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
        from app.legacy.crypto.eip712 import build_allocations_eip712_data, sign

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
        rv = self._fastapi_client.get(f"/allocations/donors/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_proposal_donors(self, epoch, proposal_address) -> tuple[dict, int]:
        rv = self._fastapi_client.get(
            f"/allocations/project/{proposal_address}/epoch/{epoch}"
        )
        return json.loads(rv.text), rv.status_code

    def get_user_allocations(self, epoch, user_address) -> tuple[dict, int]:
        rv = self._fastapi_client.get(f"/allocations/user/{user_address}/epoch/{epoch}")
        return json.loads(rv.text), rv.status_code

    def check_leverage(
        self, proposal_address, user_address, amount
    ) -> tuple[dict, int]:
        payload = {
            "allocations": [{"proposalAddress": proposal_address, "amount": amount}]
        }
        rv = self._fastapi_client.post(
            f"/allocations/leverage/{user_address}", json=payload
        )
        return json.loads(rv.text), rv.status_code

    def get_epoch_patrons(self, epoch) -> tuple[dict, int]:
        rv = self._fastapi_client.get(f"/user/patrons/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_patron_mode_status(self, user_address) -> tuple[dict, int]:
        rv = self._fastapi_client.get(f"/user/{user_address}/patron-mode")
        return json.loads(rv.text), rv.status_code

    def patch_patron(self, user_address, signature):
        rv = self._fastapi_client.patch(
            f"/user/{user_address}/patron-mode",
            json={"signature": signature},
        )
        return json.loads(rv.text), rv.status_code

    def get_user_tos_status(self, user_address) -> tuple[dict, int]:
        rv = self._fastapi_client.get(f"/user/{user_address}/tos")
        return json.loads(rv.text), rv.status_code

    def accept_tos(self, user_address, signature):
        rv = self._fastapi_client.post(
            f"/user/{user_address}/tos",
            json={"signature": signature},
        )
        return json.loads(rv.text), rv.status_code

    def get_user_history(self, user_address: str) -> tuple[dict, int]:
        rv = self._fastapi_client.get(f"/history/{user_address}")
        return json.loads(rv.text), rv.status_code

    def get_user_uq(self, user_address: str, epoch: int) -> tuple[dict, int]:
        rv = self._fastapi_client.get(f"/user/{user_address}/uq/{epoch}")
        return json.loads(rv.text), rv.status_code

    def get_all_uqs(self, epoch: int) -> tuple[dict, int]:
        rv = self._fastapi_client.get(f"user/uq/{epoch}/all")
        return json.loads(rv.text), rv.status_code

    def get_antisybil_score(self, user_address: str) -> tuple[dict, int]:
        rv = self._fastapi_client.get(f"/user/{user_address}/antisybil-status")
        return json.loads(rv.text), rv.status_code

    def refresh_antisybil_score(self, user_address: str) -> tuple[str, int]:
        rv = self._fastapi_client.put(f"/user/{user_address}/antisybil-status")
        return rv.text, rv.status_code

    def get_chain_info(self) -> tuple[dict, int]:
        rv = self._fastapi_client.get("/info/chain-info")
        return json.loads(rv.text), rv.status_code

    def get_version(self) -> tuple[dict, int]:
        rv = self._fastapi_client.get("/info/version")
        return json.loads(rv.text), rv.status_code

    def get_healthcheck(self) -> tuple[dict, int]:
        rv = self._fastapi_client.get("/info/healthcheck")
        return json.loads(rv.text), rv.status_code

    def check_delegation(self, *addresses) -> tuple[dict, int]:
        addresses = ",".join(addresses)
        rv = self._fastapi_client.get(f"/delegation/check/{addresses}")
        return json.loads(rv.text), rv.status_code

    def delegate(
        self,
        primary_address: str,
        secondary_address: str,
        primary_address_signature: str,
        secondary_address_signature: str,
    ) -> tuple[dict, int]:
        rv = self._fastapi_client.post(
            "/delegation/delegate",
            json={
                "primaryAddr": primary_address,
                "secondaryAddr": secondary_address,
                "primaryAddrSignature": primary_address_signature,
                "secondaryAddrSignature": secondary_address_signature,
            },
        )
        return json.loads(rv.text), rv.status_code

    def delegation_recalculate(
        self,
        primary_address: str,
        secondary_address: str,
        primary_address_signature: str,
        secondary_address_signature: str,
    ) -> tuple[dict, int]:
        rv = self._fastapi_client.put(
            "/delegation/recalculate",
            json={
                "primaryAddr": primary_address,
                "secondaryAddr": secondary_address,
                "primaryAddrSignature": primary_address_signature,
                "secondaryAddrSignature": secondary_address_signature,
            },
        )
        return json.loads(rv.text), rv.status_code


class FastUserAccount:
    def __init__(self, account, client: FastAPIClient):
        self._account = account
        self._client = fclient

    @property
    def address(self):
        return self._account.address

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

    def transfer(self, account, value: int):
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


@pytest.fixture
def fclient(fastapi_client: TestClient) -> FastAPIClient:
    return FastAPIClient(fastapi_client)


@pytest.fixture()
def payload():
    return ScoreDelegationPayload(
        primary_addr=USER2_ADDRESS,
        secondary_addr=USER1_ADDRESS,
        primary_addr_signature="0x42a06ccb1a0ade7bd897687a10f638d32c794ca180df64ba8284933792a21a1165cbe8678970dc3657e09c0c53be1f5965573bffa47b1ec9dc9da191ca6024361b",
        secondary_addr_signature="0xc464be5ca06fe6a5ffe24cb1f73bf151cafdc9be11648833443859a6ba2dce465303629ed7d3dc08375235290c56b3b7a19e4d7235bc5a903302d0dead5976381b",
    )


@pytest.fixture(autouse=True)
def mock_fetch_streams():
    """Mock fetch_streams to return an empty list for all API tests."""
    with patch("app.infrastructure.sablier.events.fetch_streams") as mock:
        mock.return_value = []
        yield mock


@pytest.fixture
def deployer(fclient: FastAPIClient) -> FastUserAccount:
    return FastUserAccount(Account.from_key(DEPLOYER_PRIV), fclient)


@pytest.fixture
def ua_alice(fclient: FastAPIClient) -> FastUserAccount:
    return FastUserAccount(Account.from_key(ALICE), fclient)


@pytest.fixture
def ua_bob(fclient: FastAPIClient) -> FastUserAccount:
    return FastUserAccount(Account.from_key(BOB), fclient)


@pytest.fixture
def ua_carol(fclient: FastAPIClient) -> FastUserAccount:
    return FastUserAccount(Account.from_key(CAROL), fclient)


@pytest.fixture
def setup_funds(
    fclient: FastAPIClient,
    deployer: FastUserAccount,
    ua_alice: FastUserAccount,
    ua_bob: FastUserAccount,
    ua_carol: FastUserAccount,
    request,
):
    test_name = request.node.name
    logging.debug(f"RUNNING TEST: {test_name}")
    logging.debug("Setup funds before test")

    # fund Octant
    deployer.fund_octant()
    # fund Users
    deployer.transfer(ua_alice, 10000)
    deployer.transfer(ua_bob, 15000)
    deployer.transfer(ua_carol, 20000)

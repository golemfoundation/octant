from decimal import Decimal
from random import randint
from typing import Optional, List

import pytest
from eth_account import Account

from app import create_app, database
from app.core.allocations import AllocationRequest, allocate, Allocation
from app.crypto.eip712 import sign, build_allocations_eip712_data
from app.extensions import db, w3
from app.settings import TestConfig

MNEMONIC = "test test test test test test test test test test test junk"
MOCKED_PENDING_EPOCH_NO = 42
MOCKED_CURRENT_EPOCH_NO = 43
GLM_SUPPLY = 1000000000_000000000_000000000
ETH_PROCEEDS = 402_410958904_110000000
TOTAL_ED = 22700_000000000_099999994
USER1_ED = 1500_000055377_000000000
USER2_ED = 7500_000000000_000000000
LOCKED_RATIO = Decimal("0.000022700000000000099999994")
TOTAL_REWARDS = 1_917267577_180363384
ALL_INDIVIDUAL_REWARDS = 9134728_767123337


@pytest.fixture(scope="function")
def app():
    """An application for the tests."""
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
def user_accounts():
    w3.eth.account.enable_unaudited_hdwallet_features()
    return [
        w3.eth.account.from_mnemonic(MNEMONIC, account_path=f"m/44'/60'/0'/0/{i}")
        for i in range(10)
    ]


@pytest.fixture(scope="function")
def proposal_accounts():
    w3.eth.account.enable_unaudited_hdwallet_features()
    return [
        w3.eth.account.from_mnemonic(MNEMONIC, account_path=f"m/44'/60'/0'/0/{i}")
        for i in range(10, 20)
    ]


@pytest.fixture(scope="function")
def pending_epoch_snapshot(app, user_accounts):
    database.pending_epoch_snapshot.add_snapshot(
        MOCKED_PENDING_EPOCH_NO,
        GLM_SUPPLY,
        ETH_PROCEEDS,
        TOTAL_ED,
        LOCKED_RATIO,
        TOTAL_REWARDS,
        ALL_INDIVIDUAL_REWARDS,
    )
    user1 = database.user.get_or_add_user(user_accounts[0].address)
    user2 = database.user.get_or_add_user(user_accounts[1].address)
    database.deposits.add(MOCKED_PENDING_EPOCH_NO, user1, USER1_ED, USER1_ED)
    database.deposits.add(MOCKED_PENDING_EPOCH_NO, user2, USER2_ED, USER2_ED)
    db.session.commit()


@pytest.fixture(scope="function")
def allocations(app, user_accounts, proposal_accounts):
    user1 = database.user.get_or_add_user(user_accounts[0].address)
    user2 = database.user.get_or_add_user(user_accounts[1].address)
    db.session.commit()
    user1_allocations = [
        Allocation(proposal_accounts[0].address, 10 * 10**18),
        Allocation(proposal_accounts[1].address, 5 * 10**18),
        Allocation(proposal_accounts[2].address, 300 * 10**18),
    ]

    user2_allocations = [
        Allocation(proposal_accounts[1].address, 1050 * 10**18),
        Allocation(proposal_accounts[3].address, 500 * 10**18),
    ]
    database.allocations.add_all(MOCKED_PENDING_EPOCH_NO, user1.id, user1_allocations)
    database.allocations.add_all(MOCKED_PENDING_EPOCH_NO, user2.id, user2_allocations)
    db.session.commit()


def allocate_user_rewards(user_account: Account, proposal_account, allocation_amount):
    payload = create_payload([proposal_account], [allocation_amount])
    signature = sign(user_account, build_allocations_eip712_data(payload))
    request = AllocationRequest(payload, signature, override_existing_allocations=False)

    allocate(request)


def create_payload(proposals, amounts: Optional[List[int]]):
    if amounts is None:
        amounts = [randint(1 * 10**18, 100_000_000 * 10**18) for _ in proposals]

    allocations = [
        {
            "proposalAddress": proposal.address,
            "amount": str(amount),
        }
        for proposal, amount in zip(proposals, amounts)
    ]

    return {"allocations": allocations}

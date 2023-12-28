import pytest

from app.legacy.crypto.eip712 import (
    sign,
    recover_address,
    build_allocations_eip712_data,
    build_claim_glm_eip712_data,
)


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_sign_and_recover_address_from_allocations(user_accounts):
    account = user_accounts[0]
    payload = {
        "allocations": [
            {
                "proposalAddress": "0x1234567890123456789012345678901234567893",
                "amount": 150,
            },
            {
                "proposalAddress": "0x2345678901234567890123456789012345678904",
                "amount": 250,
            },
        ],
        "nonce": 0,
    }

    eip712_data = build_allocations_eip712_data(payload)
    signature = sign(account, eip712_data)

    address = recover_address(eip712_data, signature)

    assert address == account.address


def test_fails_when_data_to_recover_has_changed(user_accounts):
    account = user_accounts[0]
    payload = {
        "allocations": [
            {
                "proposalAddress": "0x1234567890123456789012345678901234567893",
                "amount": 150,
            },
            {
                "proposalAddress": "0x2345678901234567890123456789012345678904",
                "amount": 250,
            },
        ],
        "nonce": 0,
    }
    eip712_data = build_allocations_eip712_data(payload)
    signature = sign(account, eip712_data)

    changed_payload = {
        "allocations": [
            {
                "proposalAddress": "0x0000000000000000000000000000000000000000",
                "amount": 150000,
            },
        ],
        "nonce": 0,
    }
    eip712_data = build_allocations_eip712_data(changed_payload)
    address = recover_address(eip712_data, signature)

    assert address != account.address


def test_fails_when_nonce_has_changed(user_accounts):
    account = user_accounts[0]
    payload = {
        "allocations": [
            {
                "proposalAddress": "0x1234567890123456789012345678901234567893",
                "amount": 150,
            },
            {
                "proposalAddress": "0x2345678901234567890123456789012345678904",
                "amount": 250,
            },
        ],
        "nonce": 0,
    }
    eip712_data = build_allocations_eip712_data(payload)
    signature = sign(account, eip712_data)

    changed_payload = {"allocations": payload["allocations"], "nonce": 1}
    eip712_data = build_allocations_eip712_data(changed_payload)
    address = recover_address(eip712_data, signature)

    assert address != account.address


def test_sign_and_recover_address_for_glm_claim(user_accounts):
    account = user_accounts[0]

    eip712_data = build_claim_glm_eip712_data()
    signature = sign(account, eip712_data)

    address = recover_address(eip712_data, signature)

    assert address == account.address

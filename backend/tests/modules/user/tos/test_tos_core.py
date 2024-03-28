import pytest

from app.modules.user.tos.core import verify_signature
from tests.conftest import MOCK_IS_CONTRACT
from tests.helpers.signature import build_user_signature


@pytest.fixture(autouse=True)
def before(app, patch_is_contract):
    pass


@pytest.fixture
def metamask_valid_signature():
    address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    signature = "0x304cd12d8b9a0e39dbab476d4a5ca04733786a2f25ce0fd5b244e86b61499080392c6bd98b8076b45c1bfcb91f2a7c4ede559bf398941b41821f1c9eb5ba06071b"

    return address, signature


def test_verifies_valid_signature(alice):
    signature = build_user_signature(alice)

    assert verify_signature(alice.address, signature)


def test_verifies_valid_multisig_signature(alice, patch_eip1271_is_valid_signature):
    MOCK_IS_CONTRACT.return_value = True

    signature = build_user_signature(alice)

    assert verify_signature(alice.address, signature)


def test_verifies_metamask_signature(metamask_valid_signature):
    (address, signature) = metamask_valid_signature

    assert verify_signature(address, signature)


def test_rejects_someone_elses_signature(alice, bob):
    # when
    # bob signs alices address
    signature = build_user_signature(bob, alice.address)

    # then
    # bob cannot verify neither as alice nor as himself
    assert verify_signature(alice.address, signature) is False
    assert verify_signature(bob.address, signature) is False


def test_rejects_invalid_signature(alice):
    invalid_signature = "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    assert verify_signature(alice.address, invalid_signature) is False

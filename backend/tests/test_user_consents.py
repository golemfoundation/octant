import pytest
from eth_account.messages import encode_defunct

from app import exceptions
from app.infrastructure import database
from app.legacy.core.user.tos import (
    has_user_agreed_to_terms_of_service,
    add_user_terms_of_service_consent,
)
from app.legacy.crypto.eth_sign import terms_and_conditions_consent
from app.legacy.crypto.eth_sign.terms_and_conditions_consent import (
    build_consent_message,
)
from tests.conftest import MOCK_IS_CONTRACT


@pytest.fixture(autouse=True)
def before(patch_is_contract):
    pass


@pytest.fixture
def consenting_alice(app, alice):
    database.user_consents.add_consent(alice.address, "127.0.0.1")
    return alice


@pytest.fixture
def unwilling_bob(bob):
    return bob


@pytest.fixture
def metamask_valid_signature():
    address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    signature = "0x304cd12d8b9a0e39dbab476d4a5ca04733786a2f25ce0fd5b244e86b61499080392c6bd98b8076b45c1bfcb91f2a7c4ede559bf398941b41821f1c9eb5ba06071b"

    return address, signature


def _build_user_signature(user, user_address=None):
    if user_address is None:
        user_address = user.address

    msg = build_consent_message(user_address)
    message = encode_defunct(text=msg)
    signature_bytes = user.sign_message(message).signature

    return signature_bytes


def test_verifies_valid_signature(alice):
    signature = _build_user_signature(alice)

    assert terms_and_conditions_consent.verify(alice.address, signature)


def test_verifies_valid_multisig_signature(alice, patch_eip1271_is_valid_signature):
    MOCK_IS_CONTRACT.return_value = True

    signature = _build_user_signature(alice)

    assert terms_and_conditions_consent.verify(alice.address, signature)


def test_verifies_metamask_signature(metamask_valid_signature):
    (address, signature) = metamask_valid_signature

    assert terms_and_conditions_consent.verify(address, signature)


def test_rejects_someone_elses_signature(alice, bob):
    # when
    # bob signs alices address
    signature = _build_user_signature(bob, alice.address)

    # then
    # bob cannot verify neither as alice nor as himself
    assert terms_and_conditions_consent.verify(alice.address, signature) is False
    assert terms_and_conditions_consent.verify(bob.address, signature) is False


def test_rejects_invalid_signature(alice):
    invalid_signature = "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    assert (
        terms_and_conditions_consent.verify(alice.address, invalid_signature) is False
    )


def test_get_user_terms_of_service_consent(app, consenting_alice, unwilling_bob):
    assert has_user_agreed_to_terms_of_service(consenting_alice.address) is True
    assert has_user_agreed_to_terms_of_service(unwilling_bob.address) is False


def test_getting_consent_status_does_not_create_new_user_if_one_does_not_yet_exist(
    app, consenting_alice, unwilling_bob
):
    assert has_user_agreed_to_terms_of_service(consenting_alice.address) is True
    assert database.user.get_by_address(consenting_alice.address) is not None

    assert has_user_agreed_to_terms_of_service(unwilling_bob.address) is False
    assert database.user.get_by_address(unwilling_bob.address) is None


def test_can_add_users_consent(app, alice):
    # given
    signature = _build_user_signature(alice)
    assert has_user_agreed_to_terms_of_service(alice.address) is False

    # when
    add_user_terms_of_service_consent(alice.address, signature, "127.0.0.1")

    # then
    assert has_user_agreed_to_terms_of_service(alice.address) is True


def test_cannot_add_users_consent_twice(app, consenting_alice):
    # given
    signature = _build_user_signature(consenting_alice)
    assert has_user_agreed_to_terms_of_service(consenting_alice.address) is True

    # when
    with pytest.raises(exceptions.DuplicateConsent):
        add_user_terms_of_service_consent(
            consenting_alice.address, signature, "127.0.0.1"
        )

    # then
    assert has_user_agreed_to_terms_of_service(consenting_alice.address) is True


def test_rejects_to_add_consent_with_invalid_signature(app, alice, bob):
    # given
    signature = _build_user_signature(bob, alice.address)

    # when
    with pytest.raises(exceptions.InvalidSignature):
        add_user_terms_of_service_consent(alice.address, signature, "127.0.0.1")

    with pytest.raises(exceptions.InvalidSignature):
        add_user_terms_of_service_consent(bob.address, signature, "127.0.0.1")

    # then
    assert has_user_agreed_to_terms_of_service(alice.address) is False
    assert has_user_agreed_to_terms_of_service(bob.address) is False

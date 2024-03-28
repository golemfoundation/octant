import pytest

from app.exceptions import DuplicateConsent, InvalidSignature
from app.infrastructure import database
from app.modules.user.tos.service.initial import InitialUserTos, InitialUserTosVerifier
from tests.helpers.signature import build_user_signature


@pytest.fixture(autouse=True)
def before(app, patch_is_contract):
    pass


@pytest.fixture
def consenting_alice(app, alice):
    database.user_consents.add_consent(alice.address, "127.0.0.1")
    return alice


@pytest.fixture
def unwilling_bob(bob):
    return bob


def test_get_user_terms_of_service_consent(
    context, consenting_alice, unwilling_bob, mock_verifier
):
    service = InitialUserTos(verifier=mock_verifier)

    assert (
        service.has_user_agreed_to_terms_of_service(context, consenting_alice.address)
        is True
    )
    assert (
        service.has_user_agreed_to_terms_of_service(context, unwilling_bob.address)
        is False
    )


def test_getting_consent_status_does_not_create_new_user_if_one_does_not_yet_exist(
    context, consenting_alice, unwilling_bob, mock_verifier
):
    service = InitialUserTos(verifier=mock_verifier)

    assert (
        service.has_user_agreed_to_terms_of_service(context, consenting_alice.address)
        is True
    )
    assert database.user.get_by_address(consenting_alice.address) is not None

    assert (
        service.has_user_agreed_to_terms_of_service(context, unwilling_bob.address)
        is False
    )
    assert database.user.get_by_address(unwilling_bob.address) is None


def test_can_add_users_consent(context, alice, mock_verifier):
    signature = build_user_signature(alice)
    service = InitialUserTos(verifier=mock_verifier)
    assert service.has_user_agreed_to_terms_of_service(context, alice.address) is False

    service.add_user_terms_of_service_consent(
        context, alice.address, signature, "127.0.0.1"
    )
    assert service.has_user_agreed_to_terms_of_service(context, alice.address) is True


def test_cannot_add_users_consent_twice(context, consenting_alice):
    service = InitialUserTos(verifier=InitialUserTosVerifier())
    signature = build_user_signature(consenting_alice)
    assert (
        service.has_user_agreed_to_terms_of_service(context, consenting_alice.address)
        is True
    )

    with pytest.raises(DuplicateConsent):
        service.add_user_terms_of_service_consent(
            context, consenting_alice.address, signature, "127.0.0.1"
        )
    assert (
        service.has_user_agreed_to_terms_of_service(context, consenting_alice.address)
        is True
    )


def test_rejects_to_add_consent_with_invalid_signature(context, alice, bob):
    service = InitialUserTos(verifier=InitialUserTosVerifier())
    signature = build_user_signature(bob, alice.address)

    # when
    with pytest.raises(InvalidSignature):
        service.add_user_terms_of_service_consent(
            context, alice.address, signature, "127.0.0.1"
        )

    with pytest.raises(InvalidSignature):
        service.add_user_terms_of_service_consent(
            context, bob.address, signature, "127.0.0.1"
        )

    assert service.has_user_agreed_to_terms_of_service(context, alice.address) is False
    assert service.has_user_agreed_to_terms_of_service(context, bob.address) is False

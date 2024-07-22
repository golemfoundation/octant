import pytest
from app import exceptions, db
from datetime import datetime
from app.exceptions import UserNotFound
from app.infrastructure import database
from app.modules.common.delegation import get_hashed_addresses
from app.modules.user.antisybil.service.initial import GitcoinPassportAntisybil
from tests.helpers.context import get_context


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_antisybil_service(
    patch_gitcoin_passport_issue_address_for_scoring,
    patch_gitcoin_passport_fetch_score,
    patch_gitcoin_passport_fetch_stamps,
    mock_users_db,
):
    context = get_context(4)

    service = GitcoinPassportAntisybil()

    unknown_address = "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"
    try:
        service.get_antisybil_status(context, unknown_address)
    except UserNotFound:
        pass  # expected

    alice, _, _ = mock_users_db
    assert service.get_antisybil_status(context, alice.address) is None

    score, expires_at, stamps = service.fetch_antisybil_status(context, alice.address)
    assert score == 2.572
    assert len(stamps) == 3
    assert expires_at == datetime.strptime("2090-01-01T00:00:00Z", "%Y-%m-%dT%H:%M:%SZ")

    service.update_antisybil_status(context, alice.address, score, expires_at, stamps)

    score, _ = service.get_antisybil_status(context, alice.address)
    assert score == 2.572


def test_guest_stamp_score_bump_for_both_gp_and_octant_side_application(
    patch_gitcoin_passport_issue_address_for_scoring,
    patch_gitcoin_passport_fetch_score,
    patch_gitcoin_passport_fetch_stamps,
    mock_users_db,
):
    context = get_context(4)

    service = GitcoinPassportAntisybil()
    alice, _, _ = mock_users_db

    score, expires_at, stamps = service.fetch_antisybil_status(context, alice.address)
    service.update_antisybil_status(context, alice.address, score, expires_at, stamps)
    score, _ = service.get_antisybil_status(context, alice.address)
    assert score == 2.572  # guest list score bonus not applied

    guest_address = "0x2f51E78ff8aeC6A941C4CEeeb26B4A1f03737c50"
    database.user.add_user(guest_address)
    score, expires_at, stamps = service.fetch_antisybil_status(context, guest_address)
    service.update_antisybil_status(context, guest_address, score, expires_at, stamps)
    score, _ = service.get_antisybil_status(context, guest_address)
    assert (not stamps) and (
        score == 21.0
    )  # is on guest list, no stamps, applying 21 score bonus manually

    stamp_address = "0xBc6d82D8d6632938394905Bb0217Ad9c673015d1"
    database.user.add_user(stamp_address)
    score, expires_at, stamps = service.fetch_antisybil_status(context, stamp_address)
    service.update_antisybil_status(context, stamp_address, score, expires_at, stamps)
    score, _ = service.get_antisybil_status(context, stamp_address)
    assert (stamps) and (
        score == 22.0
    )  # is on guest list, HAS GUEST LIST STAMP, score is from fetch


def test_antisybil_cant_be_update_when_address_is_delegated(alice, bob):
    context = get_context(4)
    score = 2.572
    primary, secondary, both = get_hashed_addresses(alice.address, bob.address)
    database.score_delegation.save_delegation(primary, secondary, both)
    db.session.commit()

    service = GitcoinPassportAntisybil()

    with pytest.raises(exceptions.AddressAlreadyDelegated):
        service.update_antisybil_status(
            context, alice.address, score, datetime.now(), {}
        )

    with pytest.raises(exceptions.AddressAlreadyDelegated):
        service.update_antisybil_status(context, bob.address, score, datetime.now(), {})

from datetime import datetime

import pytest

from app import exceptions, db
from app.constants import GUEST_LIST
from app.exceptions import UserNotFound
from app.infrastructure import database
from app.modules.common.delegation import get_hashed_addresses
from app.modules.user.antisybil.service.initial import GitcoinPassportAntisybil
from tests.helpers.constants import TIMEOUT_LIST
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

    service = GitcoinPassportAntisybil(timeout_list=TIMEOUT_LIST, guest_list=GUEST_LIST)

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

    result = service.get_antisybil_status(context, alice.address)
    score = result.score
    assert score == 2.572


def test_gtc_staking_stamp_nullification(
    patch_gitcoin_passport_issue_address_for_scoring,
    patch_gitcoin_passport_fetch_score,
    patch_gitcoin_passport_fetch_stamps,
    mock_users_db,
):
    context = get_context(4)
    service = GitcoinPassportAntisybil(timeout_list=TIMEOUT_LIST, guest_list=GUEST_LIST)
    _, _, carol = mock_users_db
    score, expires_at, stamps = service.fetch_antisybil_status(context, carol.address)
    service.update_antisybil_status(context, carol.address, score, expires_at, stamps)

    result = service.get_antisybil_status(context, carol.address)

    assert result.score == pytest.approx(0.491)


def test_guest_stamp_score_bump_for_both_gp_and_octant_side_application(
    patch_gitcoin_passport_issue_address_for_scoring,
    patch_gitcoin_passport_fetch_score,
    patch_gitcoin_passport_fetch_stamps,
    mock_users_db,
):
    context = get_context(4)

    alice, bob, _ = mock_users_db
    service = GitcoinPassportAntisybil(
        timeout_list=TIMEOUT_LIST, guest_list={alice.address.lower()}
    )

    score, expires_at, stamps = service.fetch_antisybil_status(context, bob.address)

    service.update_antisybil_status(context, bob.address, score, expires_at, stamps)
    result = service.get_antisybil_status(context, bob.address)
    score = result.score
    assert score == 0.0  # nullified score, address is not on the GUEST_LIST

    guest_address = alice.address
    score, expires_at, stamps = service.fetch_antisybil_status(context, guest_address)
    service.update_antisybil_status(context, guest_address, score, expires_at, stamps)
    result = service.get_antisybil_status(context, guest_address)
    score = result.score

    assert len(stamps) > 0  # has stamps from the mock
    assert (
        score == 2.572 + 21.0
    )  # is on guest list, applying additional 21 score bonus manually

    stamp_address = "0xBc6d82D8d6632938394905Bb0217Ad9c673015d1"
    database.user.add_user(stamp_address)
    score, expires_at, stamps = service.fetch_antisybil_status(context, stamp_address)
    service.update_antisybil_status(context, stamp_address, score, expires_at, stamps)
    result = service.get_antisybil_status(context, stamp_address)
    score = result.score
    assert len(stamps) > 0
    assert score == 22.0  # is on guest list, HAS GUEST LIST STAMP, score is from fetch


def test_antisybil_cant_be_update_when_address_is_delegated(alice, bob):
    context = get_context(4)
    score = 2.572
    primary, secondary, both = get_hashed_addresses(alice.address, bob.address)
    database.score_delegation.save_delegation(primary, secondary, both)
    db.session.commit()

    service = GitcoinPassportAntisybil(timeout_list=TIMEOUT_LIST, guest_list=GUEST_LIST)

    with pytest.raises(exceptions.AddressAlreadyDelegated):
        service.update_antisybil_status(
            context, alice.address, score, datetime.now(), {}
        )

    with pytest.raises(exceptions.AddressAlreadyDelegated):
        service.update_antisybil_status(context, bob.address, score, datetime.now(), {})


def test_antisybil_score_is_nullified_when_address_on_timeout_list(
    patch_gitcoin_passport_issue_address_for_scoring,
    patch_gitcoin_passport_fetch_score,
    patch_gitcoin_passport_fetch_stamps,
    mock_users_db,
):
    context = get_context(4)

    service = GitcoinPassportAntisybil(
        timeout_list={"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"},
        guest_list=GUEST_LIST,
    )
    alice, _, _ = mock_users_db
    timeout_address = alice.address
    score, expires_at, stamps = service.fetch_antisybil_status(context, timeout_address)
    service.update_antisybil_status(context, timeout_address, score, expires_at, stamps)

    result = service.get_antisybil_status(context, timeout_address)

    assert result.score == 0.0
    assert result.is_on_timeout_list is True


def test_fetch_antisybil_return_0_when_address_on_timeout_list(
    patch_gitcoin_passport_issue_address_for_scoring,
    patch_gitcoin_passport_fetch_score,
    patch_gitcoin_passport_fetch_stamps,
    mock_users_db,
):
    context = get_context(4)

    service = GitcoinPassportAntisybil(
        timeout_list={"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"},
        guest_list=GUEST_LIST,
    )
    alice, _, _ = mock_users_db
    timeout_address = alice.address
    score, expires_at, stamps = service.fetch_antisybil_status(context, timeout_address)

    assert score == 0.0

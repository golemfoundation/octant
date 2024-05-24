import pytest
from app.exceptions import UserNotFound
from app.modules.user.antisybil.service.initial import InitialUserAntisybil
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

    service = InitialUserAntisybil()

    unknown_address = "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"
    try:
        service.get_antisybil_status(context, unknown_address)
    except UserNotFound:
        pass  # expected

    alice, _, _ = mock_users_db
    assert service.get_antisybil_status(context, alice.address) is None

    score, expires_at, stamps = service.fetch_antisybil_status(context, alice.address)
    assert score == 2.572
    assert len(stamps) == 2

    service.update_antisybil_status(context, alice.address, score, expires_at, stamps)

    score, _ = service.get_antisybil_status(context, alice.address)
    assert score == 2.572

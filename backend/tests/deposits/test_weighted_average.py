import pytest

from app.core.deposits.deposits import (
    get_estimated_effective_deposit,
)
from app.core.epochs.details import EpochDetails
from tests.conftest import (
    USER1_ADDRESS,
    mock_graphql,
    create_deposit_event,
)


@pytest.fixture(autouse=True)
def before(app, graphql_client):
    pass


@pytest.fixture()
def epoch_details():
    return EpochDetails(1, 1000, 1000, 500)


def test_estimated_effective_deposit_when_user_has_events(mocker, epoch_details):
    """Epochs start == 1000, epoch end == 2000"""
    events = [
        create_deposit_event(amount="1000_000000000_000000000", timestamp=1500),
        create_deposit_event(
            typename="Unlocked",
            deposit_before="1000_000000000_000000000",
            amount="500_000000000_000000000",
            timestamp=1750,
        ),
    ]
    mock_graphql(mocker, deposit_events=events)

    result = get_estimated_effective_deposit(epoch_details, USER1_ADDRESS)

    assert result == 375_000000000_000000000


def test_estimated_effective_deposit_when_user_does_not_have_events(
    mocker, epoch_details
):
    """Epochs start == 1000, epoch end == 2000"""
    mock_graphql(mocker, deposit_events=[])

    result = get_estimated_effective_deposit(epoch_details, USER1_ADDRESS)

    assert result == 0

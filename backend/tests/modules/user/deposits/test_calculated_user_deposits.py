from app.engine.user.effective_deposit import UserDeposit
from app.modules.user.deposits.service.calculated import CalculatedUserDeposits
from tests.conftest import USER1_ADDRESS
from tests.helpers.context import get_context


def test_get_total_effective_deposit(mock_events_generator):
    context = get_context()
    service = CalculatedUserDeposits(events_generator=mock_events_generator)

    result = service.get_total_effective_deposit(context)

    assert result == 50_000000000_000000000


def test_get_user_effective_deposit(
    mock_events_generator,
):
    context = get_context()
    service = CalculatedUserDeposits(events_generator=mock_events_generator)

    result = service.get_user_effective_deposit(context, USER1_ADDRESS)

    assert result == 50_000000000_000000000


def test_get_all_deposits(
    mock_events_generator,
):
    context = get_context()
    service = CalculatedUserDeposits(events_generator=mock_events_generator)

    result = service.get_all_effective_deposits(context)

    assert result[0] == [
        UserDeposit(
            user_address=USER1_ADDRESS,
            effective_deposit=50_000000000_000000000,
            deposit=100000000000000000000,
        )
    ]
    assert result[1] == 50_000000000_000000000

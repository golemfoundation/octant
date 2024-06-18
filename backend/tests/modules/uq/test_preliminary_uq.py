from datetime import datetime

import pytest

from tests.helpers.constants import USER1_ADDRESS


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_calculate_uq_above_threshold(context, mock_antisybil, service):
    mock_antisybil.get_antisybil_status.return_value = (20.0, datetime.now())
    result = service.calculate(context, USER1_ADDRESS)
    assert result == 1.0


def test_calculate_uq_below_threshold(context, service):
    result = service.calculate(context, USER1_ADDRESS)
    assert result == 0.2

from decimal import Decimal

import pytest

from app.extensions import db
from app.infrastructure import database
from tests.helpers.allocations import mock_request
from tests.helpers.constants import USER1_ADDRESS


@pytest.fixture(autouse=True)
def before(app):
    pass


def test_calculate_uq_above_threshold(context, service, mock_users_db):
    alice, _, _ = mock_users_db

    database.allocations.store_allocation_request(alice.address, 1, mock_request(0))
    database.allocations.store_allocation_request(alice.address, 2, mock_request(1))
    db.session.commit()

    result = service.calculate(context, USER1_ADDRESS)
    assert result == 1.0


def test_calculate_uq_below_threshold(context, service, mock_users_db):
    alice, _, _ = mock_users_db

    database.allocations.store_allocation_request(alice.address, 1, mock_request(0))
    db.session.commit()

    result = service.calculate(context, USER1_ADDRESS)
    assert result == Decimal("0.2")

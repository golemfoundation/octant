from decimal import Decimal

import pytest

from app.extensions import db
from app.infrastructure import database
from tests.helpers.allocations import mock_request
from tests.helpers.constants import USER1_ADDRESS, USER2_ADDRESS
from tests.helpers.context import get_context


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


def test_retrieve_uq_when_score_in_the_db(service, mock_users_db_with_scores):
    context = get_context(epoch_num=4)
    _, bob, _ = mock_users_db_with_scores

    database.allocations.store_allocation_request(bob.address, 4, mock_request(0))
    db.session.commit()

    result = service.retrieve(context, USER2_ADDRESS)
    assert result == Decimal("1")


def test_retrieve_uq_when_score_calculated_dynamically(context, service, mock_users_db):
    alice, _, _ = mock_users_db

    database.allocations.store_allocation_request(alice.address, 1, mock_request(0))
    db.session.commit()

    result = service.retrieve(context, USER1_ADDRESS)
    assert result == Decimal("0.2")

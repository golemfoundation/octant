from unittest.mock import Mock
import pytest
from datetime import datetime

from app.extensions import db
from app.infrastructure import database
from app.modules.uq.service.preliminary import PreliminaryUQ
from tests.helpers.allocations import mock_request
from tests.helpers.constants import USER1_ADDRESS


@pytest.fixture(autouse=True)
def before(app):
    pass


@pytest.fixture
def mock_antisybil():
    mock = Mock()
    mock.get_antisybil_status.return_value = (10.0, datetime.now())
    return mock


@pytest.fixture
def mock_epoch0_whitelist():
    mock = Mock()
    mock.exists.return_value = False
    return mock


@pytest.fixture
def mock_identity_call_whitelist():
    mock = Mock()
    mock.exists.return_value = False
    return mock


@pytest.fixture
def service(mock_antisybil, mock_epoch0_whitelist, mock_identity_call_whitelist):
    return PreliminaryUQ(
        antisybil=mock_antisybil,
        epoch0_whitelist=mock_epoch0_whitelist,
        identity_call_whitelist=mock_identity_call_whitelist,
    )


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
    assert result == 0.2

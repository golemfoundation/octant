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
def mock_epoch0_poap():
    mock = Mock()
    mock.has_poap.return_value = False
    return mock


@pytest.fixture
def mock_identity_poap():
    mock = Mock()
    mock.has_poap.return_value = False
    return mock


@pytest.fixture
def service(mock_antisybil, mock_epoch0_poap, mock_identity_poap):
    return PreliminaryUQ(
        antisybil=mock_antisybil,
        epoch0_poap=mock_epoch0_poap,
        identity_poap=mock_identity_poap,
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

from datetime import datetime
from unittest.mock import Mock

import pytest

from app.modules.uq.service.preliminary import PreliminaryUQ


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

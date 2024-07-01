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
def service(mock_antisybil, mock_user_budgets):
    return PreliminaryUQ(antisybil=mock_antisybil, budgets=mock_user_budgets)

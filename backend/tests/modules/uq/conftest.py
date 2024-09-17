from datetime import datetime
from unittest.mock import Mock

import pytest

from app.modules.uq.service.preliminary import PreliminaryUQ
from tests.helpers.constants import UQ_THRESHOLD_MAINNET


@pytest.fixture
def mock_antisybil():
    mock = Mock()
    mock.get_antisybil_status.return_value = (10.0, datetime.now())
    return mock


@pytest.fixture
def mock_holonym():
    mock = Mock()
    mock.get_sbt_status.return_value = (False, ["phone"])
    return mock


@pytest.fixture
def service(mock_antisybil, mock_holonym, mock_user_budgets):
    return PreliminaryUQ(
        passport=mock_antisybil,
        holonym=mock_holonym,
        budgets=mock_user_budgets,
        uq_threshold=UQ_THRESHOLD_MAINNET,
    )

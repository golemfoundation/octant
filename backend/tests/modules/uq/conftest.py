from datetime import datetime
from unittest.mock import Mock

import pytest

from app.modules.uq.service.preliminary import PreliminaryUQ
from app.modules.user.antisybil.dto import AntisybilStatusDTO
from tests.helpers.constants import UQ_THRESHOLD_MAINNET


@pytest.fixture
def mock_antisybil():
    mock = Mock()
    mock.get_antisybil_status.return_value = AntisybilStatusDTO(
        score=10.0, expires_at=datetime.now(), is_on_timeout_list=False
    )
    return mock


@pytest.fixture
def service(mock_antisybil, mock_user_budgets):
    return PreliminaryUQ(
        antisybil=mock_antisybil,
        budgets=mock_user_budgets,
        uq_threshold=UQ_THRESHOLD_MAINNET,
    )

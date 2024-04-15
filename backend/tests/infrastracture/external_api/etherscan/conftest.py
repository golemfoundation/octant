from unittest.mock import MagicMock

import pytest


@pytest.fixture(autouse=True)
def before(app):
    pass


@pytest.fixture
def mock_response():
    mock = MagicMock()
    mock.json.return_value = {"message": "OK"}
    return mock

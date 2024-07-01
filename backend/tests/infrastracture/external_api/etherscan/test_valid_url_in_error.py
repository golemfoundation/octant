from unittest.mock import patch

import pytest

from app.exceptions import ExternalApiException
from app.infrastructure.external_api.etherscan.account import get_transactions
from tests.infrastracture.external_api.etherscan.constants import (
    TEST_ADDRESS,
    START_BLOCK,
    END_BLOCK,
    ERROR_MESSAGE,
)


def test_get_transactions_success(mock_response):
    with patch(
        "app.infrastructure.external_api.etherscan.blocks.requests.get",
        return_value=mock_response,
    ) as mock_get:
        transactions = get_transactions(TEST_ADDRESS, START_BLOCK, END_BLOCK)
        assert isinstance(transactions, list)
        mock_get.assert_called_once()


def test_get_transactions_raises_error_and_api_key_not_leaked():
    with patch(
        "app.infrastructure.external_api.etherscan.account.requests.get"
    ) as mock_get, pytest.raises(ExternalApiException) as excinfo:
        mock_get.json.return_value = {"message": "NOT_OK"}
        get_transactions(TEST_ADDRESS, START_BLOCK, END_BLOCK)

    excinfo_msg = excinfo.value.message
    assert ERROR_MESSAGE == excinfo_msg

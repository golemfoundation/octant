from unittest.mock import patch

import pytest
from flask import current_app as app

from app.constants import ETHERSCAN_API
from app.exceptions import ExternalApiException
from app.infrastructure.external_api.etherscan.account import get_transactions
from tests.infrastracture.external_api.etherscan.constants import (
    TEST_ADDRESS,
    START_BLOCK,
    END_BLOCK,
    OBFUSCATED_API_KEY,
)


def test_get_transactions_success(mock_response):
    with patch(
        "app.infrastructure.external_api.etherscan.blocks.requests.get",
        return_value=mock_response,
    ) as mock_get:
        transactions = get_transactions(TEST_ADDRESS, START_BLOCK, END_BLOCK)
        assert isinstance(transactions, list)
        mock_get.assert_called_once()


def test_get_transactions_raises_error_and_api_key_is_obfuscated():
    with patch(
        "app.infrastructure.external_api.etherscan.blocks.requests.get"
    ) as mock_get, pytest.raises(ExternalApiException) as excinfo:
        mock_get.json.return_value = {"message": "NOT_OK"}
        get_transactions(TEST_ADDRESS, START_BLOCK, END_BLOCK)

    excinfo_msg = excinfo.value.message
    print(excinfo_msg)
    assert (
        ETHERSCAN_API in excinfo_msg
        and app.config["ETHERSCAN_API_KEY"] not in excinfo_msg
        and OBFUSCATED_API_KEY in excinfo_msg
    )

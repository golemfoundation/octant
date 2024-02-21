import app as app_module
import requests
from app.constants import ETHERSCAN_API
from app.exceptions import ExternalApiException
from app.infrastructure.external_api.etherscan.helpers import raise_for_status
from app.infrastructure.external_api.etherscan.req_params import (
    ClosestValue,
    BlockAction,
)
from flask import current_app as app


def get_block_num_from_ts(timestamp: int) -> int:
    app.logger.debug(f"Getting block number from timestamp: {timestamp}")
    api_url = _get_api_url(timestamp, BlockAction.BLOCK_NO_BY_TS)
    try:
        response = requests.get(api_url)
        raise_for_status(response)
        json_response = response.json()
        result = int(json_response["result"])
    except requests.exceptions.RequestException as e:
        app_module.ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(api_url, e, 500)

    return result


def _get_api_url(
    timestamp: int,
    rx_type: BlockAction,
    closest: ClosestValue = ClosestValue.BEFORE.value,
) -> str:
    api_key = app.config["ETHERSCAN_API_KEY"]
    return (
        f"{ETHERSCAN_API}?module=block"
        f"&action={rx_type.value}"
        f"&timestamp={timestamp}"
        f"&apikey={api_key}"
        f"&closest={closest}"
    )

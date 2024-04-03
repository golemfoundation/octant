import requests
from flask import current_app as app

import app as app_module
from app.constants import ETHERSCAN_API
from app.exceptions import ExternalApiException
from app.infrastructure.external_api.etherscan.helpers import raise_for_status
from app.infrastructure.external_api.etherscan.req_params import (
    AccountAction,
    obfuscate_url,
)

MAX_RESPONSE_SIZE = 10000


def get_transactions(
    address: str, start_block: int, end_block: int, tx_type=AccountAction.NORMAL
) -> list[dict]:
    txs = []
    api_url = _get_api_url(address, tx_type)

    try:
        response = requests.get(
            f"{api_url}&startblock={start_block}&endblock={end_block}"
        )
        raise_for_status(response)
        json_response = response.json()
        result = json_response.get("result", [])
        txs.extend(result)

        if len(result) == MAX_RESPONSE_SIZE:
            start_block = int(result[-1]["blockNumber"])
            result = get_transactions(address, start_block, end_block, tx_type)
            txs.extend(result)

        return txs
    except requests.exceptions.RequestException as e:
        app_module.ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(obfuscate_url(api_url), e, 500)


def _get_api_url(address: str, tx_type: AccountAction) -> str:
    api_key = app.config["ETHERSCAN_API_KEY"]
    return (
        f"{ETHERSCAN_API}?module=account"
        f"&action={tx_type.value}"
        f"&address={address}"
        f"&apikey={api_key}"
        f"&sort=asc"
    )

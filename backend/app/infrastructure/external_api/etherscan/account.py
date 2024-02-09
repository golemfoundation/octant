from enum import StrEnum

import requests
from flask import current_app as app

from app import ExceptionHandler
from app.constants import ETHERSCAN_API
from app.exceptions import ExternalApiException

MAX_RESPONSE_SIZE = 10000


class TxType(StrEnum):
    NORMAL = "txlist"
    INTERNAL = "txlistinternal"
    BEACON_WITHDRAWAL = "txsBeaconWithdrawal"


def get_transactions(
    address: str, start_block: int, end_block: int, tx_type=TxType.NORMAL
) -> list[dict]:
    txs = []
    api_url = _get_api_url(address, tx_type)

    try:
        response = requests.get(
            f"{api_url}&startblock={start_block}&endblock={end_block}"
        )
        response.raise_for_status()
        json_response = response.json()
        result = json_response.get("result", [])
        txs.extend(result)

        if len(result) == MAX_RESPONSE_SIZE:
            start_block = int(result[-1]["blockNumber"])
            result = get_transactions(address, start_block, end_block, tx_type)
            txs.extend(result)

        return txs
    except requests.exceptions.RequestException as e:
        ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(api_url, e, 500)


def _get_api_url(address: str, tx_type: TxType) -> str:
    api_key = app.config["ETHERSCAN_API_KEY"]
    return (
        f"{ETHERSCAN_API}?module=account"
        f"&action={tx_type.value}"
        f"&address={address}"
        f"&apikey={api_key}"
        f"&sort=asc"
    )

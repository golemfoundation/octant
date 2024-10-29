from enum import StrEnum

import requests


class EtherScanAPIMessages(StrEnum):
    STATUS_OK = "OK"
    NO_TRANSACTIONS = "No transactions found"


def raise_for_status(resp: requests.Response):
    resp.raise_for_status()
    if resp.json()["message"] not in {
        EtherScanAPIMessages.STATUS_OK.value,
        EtherScanAPIMessages.NO_TRANSACTIONS.value,
    }:
        raise requests.exceptions.RequestException(
            "Message not OK in the API response!"
        )

from enum import StrEnum

import requests


class EtherScanAPIMessages(StrEnum):
    STATUS_OK = "OK"


def raise_for_status(resp: requests.Response):
    resp.raise_for_status()
    if resp.json()["message"] != EtherScanAPIMessages.STATUS_OK.value:
        raise requests.exceptions.RequestException(
            "Message not OK in the API response!"
        )

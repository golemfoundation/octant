import requests

import app as app_module
from app.constants import SAFE_API_MAINNET, SAFE_API_SEPOLIA
from app.exceptions import ExternalApiException


def get_message_details(message_hash: str, is_mainnet: bool) -> dict:
    api_url = _get_api_url(message_hash, is_mainnet)

    try:
        response = requests.request("GET", api_url)
        response.raise_for_status()
        json_response = response.json()
    except requests.exceptions.RequestException as e:
        app_module.ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(e)

    return json_response


def _get_api_url(
    message_hash: str,
    is_mainnet: bool,
) -> str:
    base_url = SAFE_API_MAINNET if is_mainnet else SAFE_API_SEPOLIA
    return f"{base_url}/messages/{message_hash}"

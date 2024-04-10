import time
from typing import Callable, Dict

import requests

import app as app_module
from app.constants import SAFE_API_MAINNET, SAFE_API_SEPOLIA
from app.exceptions import ExternalApiException


def retry_request(
    req_func: Callable,
    status_code: int,
    no_retries: int = 1,
    sleep_time: int = 1,
    **kwargs,
) -> Dict | None:
    """
    Retry request 3 times if the status code is the same as the one passed as an argument.

    **kwargs: arguments to be passed to the request function
    req_func: function to be called
    status_code: status code to be checked
    no_retries: max number of retries to be done
    sleep_time: time to sleep between retries
    """
    if no_retries > 3:
        return None

    try:
        return req_func(**kwargs)
    except ExternalApiException as e:
        if e.status_code == status_code:
            time.sleep(sleep_time)
            return retry_request(req_func, status_code, no_retries + 1, **kwargs)

        raise e


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

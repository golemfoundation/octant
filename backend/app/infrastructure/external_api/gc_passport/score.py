import requests

from app.constants import GC_PASSPORT_SCORER_API
from app.exceptions import ExternalApiException
from app.infrastructure.exception_handler import ExceptionHandler

from app.settings import config


def _get_signing_message_url() -> str:
    return f"{GC_PASSPORT_SCORER_API}/registry/signing-message"


def signing_message() -> str:
    try:
        response = requests.get(
            _get_signing_message_url(),
            headers=_authentication_headers(),
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(e, 500)


def _get_issue_address_for_scoring_url() -> str:
    return f"{GC_PASSPORT_SCORER_API}/registry/submit-passport"


def issue_address_for_scoring(address: str) -> dict:
    try:
        response = requests.post(
            _get_issue_address_for_scoring_url(),
            json={"address": address, "scorer_id": _scorer_id()},
            headers=_authentication_headers(),
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(e, 500)


def _get_fetch_score_url(scorer_id: str, address: str) -> str:
    return f"{GC_PASSPORT_SCORER_API}/registry/score/{scorer_id}/{address}"


def fetch_score(address: str) -> dict:
    try:
        response = requests.get(
            _get_fetch_score_url(_scorer_id(), address),
            headers=_authentication_headers(),
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(e, 500)


def _get_fetch_stamps_url(address: str) -> str:
    return f"{GC_PASSPORT_SCORER_API}/registry/stamps/{address}"


def fetch_stamps(address: str) -> dict:
    try:
        response = requests.get(
            _get_fetch_stamps_url(address),
            headers=_authentication_headers(),
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(e, 500)


def _scorer_id() -> str:
    return config.GC_PASSPORT_SCORER_ID


def _authentication_headers() -> dict:
    api_key = config.GC_PASSPORT_SCORER_API_KEY

    return {"X-API-KEY": api_key}

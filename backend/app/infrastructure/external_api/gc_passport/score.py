import requests

from app.constants import GC_PASSPORT_SCORER_API
from app.exceptions import ExternalApiException
from app.infrastructure.exception_handler import ExceptionHandler

from app.settings import config

def signing_message() -> str:
    try:
        response = requests.get(
            f"{GC_PASSPORT_SCORER_API}/registry/signing-message",
            headers=_authentication_headers(),
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(e, 500)
    

def issue_address_for_scoring(address: str) -> dict:
    try:
        response = requests.post(
            f"{GC_PASSPORT_SCORER_API}/registry/submit-passport",
            json={"address": address, "scorer_id": _scorer_id()},
            headers=_authentication_headers(),
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(e, 500)


def fetch_score(address: str) -> dict:
    try:
        response = requests.get(
            f"{GC_PASSPORT_SCORER_API}/registry/score/{_scorer_id()}/{address}",
            headers=_authentication_headers(),
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(e, 500)


def fetch_stamps(address: str) -> dict:
    try:
        response = requests.get(
            f"{GC_PASSPORT_SCORER_API}/registry/stamps/{address}",
            headers=_authentication_headers(),
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(e, 500)
    


def _scorer_id() -> str:
    # return app.config["GC_PASSPORT_SCORER_ID"]
    return config.GC_PASSPORT_SCORER_ID


def _authentication_headers() -> dict:
    # api_key = app.config["GC_PASSPORT_SCORER_API_KEY"]
    api_key = config.GC_PASSPORT_SCORER_API_KEY

    return {"X-API-KEY": api_key}

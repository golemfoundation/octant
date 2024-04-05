import requests

from app.constants import BEACONCHAIN_API
from app.exceptions import ExternalApiException
from app.infrastructure.exception_handler import ExceptionHandler
from web3 import Web3
from eth_typing import ChecksumAddress

VALIDATOR_API_URL_BASE = f"{BEACONCHAIN_API}/v1/validator"


def get_validators_by_address(validator_address: str) -> list[dict]:
    checked_validator_address: ChecksumAddress = Web3.to_checksum_address(
        validator_address
    )
    api_url = f"{VALIDATOR_API_URL_BASE}/eth1/{checked_validator_address}"
    try:
        offset: int = 0
        page_limit: int = 2000
        all_validators: list = []

        while True:
            response = requests.get(f"{api_url}?limit={page_limit}&offset={offset}")
            response.raise_for_status()
            json_response = response.json()
            validators = list(json_response.get("data", []))
            if not validators:
                break

            all_validators.extend(validators)
            offset += page_limit

        return all_validators
    except requests.exceptions.RequestException as e:
        ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(api_url, e, 500)


def get_detailed_validators_by_indices(indices: str) -> list:
    try:
        response = requests.post(
            VALIDATOR_API_URL_BASE, json={"indicesOrPubkey": indices}
        )
        response.raise_for_status()
        json_response = response.json()
        return list(json_response["data"])
    except requests.exceptions.RequestException as e:
        ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(VALIDATOR_API_URL_BASE, e, 500)

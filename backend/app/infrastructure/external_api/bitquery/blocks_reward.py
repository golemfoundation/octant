import requests


import app as app_module
from app.constants import BITQUERY_API
from app.exceptions import ExternalApiException
from app.infrastructure.external_api.bitquery.req_producer import (
    produce_payload,
    BitQueryActions,
    get_bitquery_header,
)


def get_blocks_rewards(
    address: str, start_time: str, end_time: str, limit: int
) -> list:
    """
    Fetch Ethereum blocks within a specified time range in ascending order by timestamp.

    Args:
    - start_time (str): The start time in ISO 8601 format.
    - end_time (str): The end time in ISO 8601 format.
    - address (str): The miner (fee recipient) address.
    - limit (int): The number of blocks to retrieve starting from start_time.
                   Useful whilst getting end_blocks exclusively from epochs.
    """
    payload = produce_payload(
        action_type=BitQueryActions.GET_BLOCK_REWARDS,
        address=address,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
    )
    headers = get_bitquery_header()

    api_url = BITQUERY_API

    try:
        response = requests.request("POST", api_url, headers=headers, data=payload)
        response.raise_for_status()
        json_response = response.json()
    except requests.exceptions.RequestException as e:
        app_module.ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(api_url, e, 500)

    blocks = json_response.json()["data"]["ethereum"]["blocks"]
    return blocks

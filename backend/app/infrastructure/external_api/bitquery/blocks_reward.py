import requests

import app as app_module
from app.constants import BITQUERY_API
from app.exceptions import ExternalApiException
from app.infrastructure.external_api.bitquery.req_producer import (
    produce_payload,
    BitQueryActions,
    get_bitquery_header,
)


def get_blocks_rewards(address: str, start_block: int, end_block: int) -> float:
    """
    Fetch Ethereum blocks rewards for given address and start and end block.

    Args:
    - start_block (str): The start block number.
    - end_block (str): The end block number.
    - address (str): The miner (fee recipient) address.
    """
    payload = produce_payload(
        action_type=BitQueryActions.GET_BLOCK_REWARDS,
        address=address,
        start_block=start_block,
        end_block=end_block,
    )
    headers = get_bitquery_header()

    api_url = BITQUERY_API

    try:
        response = requests.request("POST", api_url, headers=headers, data=payload)
        response.raise_for_status()
        json_response = response.json()
    except requests.exceptions.RequestException as e:
        app_module.ExceptionHandler.print_stacktrace(e)
        raise ExternalApiException(e, 500)

    return float(json_response["data"]["EVM"]["MinerRewards"][0]["sum"])

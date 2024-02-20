import requests

import app as app_module
from app.constants import BITQUERY_API
from app.exceptions import ExternalApiException
from app.extensions import w3
from app.infrastructure.external_api.bitquery.req_producer import (
    produce_payload,
    BitQueryActions,
    get_bitquery_header,
)


def accumulate_blocks_reward_wei(blocks: list) -> int:
    blocks_reward_gwei = 0.0
    for block in blocks:
        blocks_reward_gwei += float(block["reward"])

    return int(w3.to_wei(blocks_reward_gwei, "gwei"))


def get_blocks_reward(address: str, start_time: str, end_time: str) -> int:
    payload = produce_payload(
        action_type=BitQueryActions.GET_BLOCK_REWARDS,
        address=address,
        start_time=start_time,
        end_time=end_time,
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
    blocks_reward = accumulate_blocks_reward_wei(blocks)
    return blocks_reward

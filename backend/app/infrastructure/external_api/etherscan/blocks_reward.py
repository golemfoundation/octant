import app as app_module
import requests
from app.constants import ETHERSCAN_API
from app.exceptions import ExternalApiException
from app.infrastructure.external_api.etherscan.helpers import raise_for_status
from app.infrastructure.external_api.etherscan.req_params import BlockAction
from flask import current_app as app


def get_blocks_reward(address: str, start_block: int, end_block: int) -> int:
    app.logger.debug(
        f"Getting blocks reward from {start_block} and {end_block} for {address} address"
    )

    block_reward = 0
    for i in range(start_block, end_block + 1):
        api_url = _get_api_url(i, BlockAction.BLOCK_REWARD)

        try:
            response = requests.get(api_url)
            raise_for_status(response)
            json_response = response.json()
        except requests.exceptions.RequestException as e:
            app_module.ExceptionHandler.print_stacktrace(e)
            raise ExternalApiException(api_url, e, 500)

        result = json_response["result"]
        if result["blockMiner"] == address:
            block_reward += float(result["blockReward"])

    return block_reward


def _get_api_url(
    block_nr: int,
    block_action: BlockAction,
) -> str:
    api_key = app.config["ETHERSCAN_API_KEY"]
    return (
        f"{ETHERSCAN_API}?module=block"
        f"&action={block_action.value}"
        f"&blockno={block_nr}"
        f"&apikey={api_key}"
    )

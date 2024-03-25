import json
from enum import IntEnum

from flask import current_app as app


class BitQueryActions(IntEnum):
    GET_BLOCK_REWARDS = 0


def get_bitquery_header():
    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": app.config["BITQUERY_API_KEY"],
        "Authorization": app.config["BITQUERY_BEARER"],
    }

    return headers


def produce_payload(action_type: BitQueryActions, **query_values) -> str:
    payloads_variations = {BitQueryActions.GET_BLOCK_REWARDS: _block_rewards_payload}

    return payloads_variations[action_type](**query_values)


def _block_rewards_payload(
    start_block: int, end_block: int, address: str, **kwargs
) -> str:
    payload = json.dumps(
        {
            "query": f"""query {{
          ethereum {{
            blocks(
                height: {{gteq: {start_block}, lteq: {end_block}}},
                miner: {{is: "{address}"}}
                ) {{
              reward(blockReward: {{gt: 0}})
            }}
          }}
        }}"""
        }
    )

    return payload

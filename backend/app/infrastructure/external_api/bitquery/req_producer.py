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
    start_time: str, end_time: str, address: str, **kwargs
) -> str:
    payload = json.dumps(
        {
            "query": f"""query ($network: EthereumNetwork!, $from: ISO8601DateTime, $till: ISO8601DateTime) {{
          ethereum(network: $network) {{
            blocks(time: {{since: $from, till: $till}}) {{
              timestamp {{
                unixtime
              }}
              reward
              address: miner(miner: {{is: "{address}"}}) {{
                address
              }}
            }}
          }}
        }}""",
            "variables": json.dumps(
                {
                    "network": "ethereum",
                    "from": start_time,
                    "till": end_time,
                    "dateFormat": "%Y-%m-%d",
                }
            ),
        }
    )

    return payload

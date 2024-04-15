from flask import current_app as app
from gql import gql

from app.extensions import gql_factory


def get_user_withdrawals_history(user_address: str, from_timestamp: int, limit: int):
    query = gql(
        """
        query GetWithdrawals($userAddress: Bytes!, $fromTimestamp: Int!, $limit: Int!) {
          withdrawals(
            orderBy: timestamp
            orderDirection: desc
            where: {user: $userAddress, timestamp_lte: $fromTimestamp}
            first: $limit
          ) {
            amount
            timestamp
            user
            transactionHash
          }
        }
        """
    )

    variables = {
        "userAddress": user_address,
        "fromTimestamp": from_timestamp,
        "limit": limit,
    }

    app.logger.debug(
        f"[Subgraph] Getting user {user_address} withdrawals before ts {from_timestamp}"
    )
    partial_result = gql_factory.build().execute(query, variable_values=variables)[
        "withdrawals"
    ]

    result = []

    if len(partial_result) > 0:
        limit_timestamp = partial_result[-1]["timestamp"]
        events_at_timestamp_limit = get_withdrawals_by_address_and_timestamp_range(
            user_address, limit_timestamp, limit_timestamp + 1
        )
        result_without_events_at_timestamp_limit = list(
            filter(lambda x: x["timestamp"] != limit_timestamp, partial_result)
        )
        result = result_without_events_at_timestamp_limit + events_at_timestamp_limit
    app.logger.debug(f"[Subgraph] Received withdrawals: {result}")

    return result


def get_withdrawals_by_address_and_timestamp_range(
    user_address: str, from_timestamp: int, to_timestamp: int
):
    query = gql(
        """
        query GetWithdrawals($userAddress: Bytes!, $fromTimestamp: Int!, $toTimestamp: Int!) {
          withdrawals(
            orderBy: timestamp
            where: {user: $userAddress, timestamp_gte: $fromTimestamp, timestamp_lt: $toTimestamp}
          ) {
            amount
            timestamp
            user
            transactionHash
          }
        }
        """
    )

    variables = {
        "userAddress": user_address,
        "fromTimestamp": from_timestamp,
        "toTimestamp": to_timestamp,
    }

    app.logger.debug(
        f"[Subgraph] Getting user {user_address} withdrawals in timestamp range {from_timestamp} - {to_timestamp}"
    )

    result = gql_factory.build().execute(query, variable_values=variables)[
        "withdrawals"
    ]

    app.logger.debug(f"[Subgraph] Received withdrawals: {result}")

    return result

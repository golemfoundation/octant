from flask import current_app as app, g as request_context
from gql import gql


def get_unlocks_by_address(user_address):
    query = gql(
        """
        query GetLocks($userAddress: Bytes!) {
            unlockeds(orderBy: timestamp, where: { user: $userAddress }) {
                __typename
                amount
                timestamp
            }
        }
    """
    )

    variables = {"userAddress": user_address}

    app.logger.debug(f"[Subgraph] Getting user {user_address} unlocks")
    result = request_context.graphql_client.execute(query, variable_values=variables)[
        "unlockeds"
    ]
    app.logger.debug(f"[Subgraph] Received unlocks: {result}")

    return result


def get_unlocks_by_timestamp_range(from_ts, to_ts):
    query = gql(
        """
        query GetUnlocks($fromTimestamp: Int!, $toTimestamp: Int!) {
         unlockeds(
    orderBy: timestamp,
    where: {
      timestamp_gte: $fromTimestamp,
      timestamp_lt: $toTimestamp
    }
  ) {
    __typename
    depositBefore
    amount
    timestamp
    user
  }
}
    """
    )

    variables = {
        "fromTimestamp": from_ts,
        "toTimestamp": to_ts,
    }

    app.logger.debug(
        f"[Subgraph] Getting unlocks in timestamp range {from_ts} - {to_ts}"
    )
    result = request_context.graphql_client.execute(query, variable_values=variables)[
        "unlockeds"
    ]
    app.logger.debug(f"[Subgraph] Received unlocks: {result}")

    return result


def get_unlocks_by_address_and_timestamp_range(
    user_address: str, from_ts: int, to_ts: int
):
    query = gql(
        """
        query GetUnlocks($userAddress: Bytes!, $fromTimestamp: Int!, $toTimestamp: Int!) {
         unlockeds(
    orderBy: timestamp,
    where: {
      timestamp_gte: $fromTimestamp,
      timestamp_lt: $toTimestamp,
      user: $userAddress
    }
  ) {
    __typename
    depositBefore
    amount
    timestamp
    user
  }
}
    """
    )

    variables = {
        "userAddress": user_address,
        "fromTimestamp": from_ts,
        "toTimestamp": to_ts,
    }

    app.logger.debug(
        f"[Subgraph] Getting user {user_address} unlocks in timestamp range {from_ts} - {to_ts}"
    )
    result = request_context.graphql_client.execute(query, variable_values=variables)[
        "unlockeds"
    ]
    app.logger.debug(f"[Subgraph] Received unlocks: {result}")

    return result

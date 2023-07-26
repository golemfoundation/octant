from gql import gql

from app.extensions import graphql_client


def get_locks_by_address(user_address: str):
    query = gql(
        """
        query GetLocks($userAddress: Bytes!) {
            lockeds(orderBy: timestamp, where: { user: $userAddress }) {
                __typename
                amount
                timestamp
            }
        }
    """
    )

    variables = {"userAddress": user_address}

    return graphql_client.execute(query, variable_values=variables)["lockeds"]


def get_locks_by_timestamp_range(from_ts: int, to_ts: int):
    query = gql(
        """
        query GetLocks($fromTimestamp: Int!, $toTimestamp: Int!) {
         lockeds(
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

    return graphql_client.execute(query, variable_values=variables)["lockeds"]


def get_locks_by_address_and_timestamp_range(
    user_address: str, from_ts: int, to_ts: int
):
    query = gql(
        """
        query GetLocks($userAddress: Bytes!, $fromTimestamp: Int!, $toTimestamp: Int!) {
         lockeds(
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

    return graphql_client.execute(query, variable_values=variables)["lockeds"]

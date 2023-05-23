from gql import gql

from app.extensions import graphql_client


def get_locks_by_address(user_address):
    query = gql(
        """
        query GetLocks($userAddress: Bytes!) {
            lockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {
                __typename
                amount
                timestamp
            }
        }
    """
    )

    variables = {"userAddress": user_address}

    return graphql_client.execute(query, variable_values=variables)["lockeds"]


def get_locks_by_timestamp_range(from_ts, to_ts):
    query = gql(
        """
        query GetLocks($fromTimestamp: Int!, $toTimestamp: Int!) {
         lockeds(
    orderBy: timestamp,
    where: {
      timestamp_gte: $fromTimestamp,
      timestamp_lte: $toTimestamp
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

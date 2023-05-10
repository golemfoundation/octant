from gql import gql

from app.extensions import graphql_client


def get_locks(user_address):
    query = gql(
        """
        query GetLocks($userAddress: Bytes!) {
            lockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {
                amount
                blockTimestamp
            }
        }
    """
    )

    variables = {"userAddress": user_address}

    return graphql_client.execute(query, variable_values=variables)["lockeds"]


def get_unlocks(user_address):
    query = gql(
        """
        query GetLocks($userAddress: Bytes!) {
            unlockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {
                amount
                blockTimestamp
            }
        }
    """
    )

    variables = {"userAddress": user_address}

    return graphql_client.execute(query, variable_values=variables)["unlockeds"]

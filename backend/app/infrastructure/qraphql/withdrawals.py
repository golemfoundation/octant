from flask import current_app as app
from gql import gql

from app.extensions import graphql_client


def get_withdrawals_by_address_and_ts(user_address: str, gt_timestamp: int):
    query = gql(
        """
        query GetWithdrawals($user_address: Bytes!, $timestamp_gt: Int!) {
          withdrawals(
            orderBy: timestamp
            orderDirection: desc
            where: {user: $user_address, timestamp_gt: $timestamp_gt}
          ) {
            amount
            timestamp
            user
          }
        }
    """
    )

    variables = {"user_address": user_address, "timestamp_gt": gt_timestamp}

    app.logger.info(
        f"[Subgraph] Getting user {user_address} withdrawals after ts {gt_timestamp}"
    )
    result = graphql_client.execute(query, variable_values=variables)["withdrawals"]
    app.logger.info(f"[Subgraph] Received withdrawals: {result}")

    return result

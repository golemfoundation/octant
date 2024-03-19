from typing import Literal, TypedDict
from flask import current_app as app
from gql import gql

from app.extensions import gql_factory


class UnlockEvent(TypedDict):
    __typename: Literal["Unlocked"]
    depositBefore: int
    amount: int
    timestamp: int
    user: str
    transactionHash: str


def get_user_unlocks_history(
    user_address: str, from_timestamp: int, limit: int
) -> list[UnlockEvent]:
    query = gql(
        """
        query GetUnlocks($userAddress: Bytes!, $fromTimestamp: Int!, $limit: Int!) {
          unlockeds(
            orderBy: timestamp
            orderDirection: desc
            where: {user: $userAddress, timestamp_lte: $fromTimestamp}
            first: $limit
          ) {
            __typename
            depositBefore
            amount
            timestamp
            transactionHash
            user
          }
        }
    """
    )

    variables = {
        "userAddress": user_address,
        "fromTimestamp": from_timestamp,
        "limit": limit,
    }

    app.logger.debug(f"[Subgraph] Getting user {user_address} unlocks")
    partial_result = gql_factory.build().execute(query, variable_values=variables)[
        "unlockeds"
    ]

    result = []

    if len(partial_result) > 0:
        limit_timestamp = partial_result[-1]["timestamp"]
        events_at_timestamp_limit = get_unlocks_by_address_and_timestamp_range(
            user_address, limit_timestamp, limit_timestamp + 1
        )
        result_without_events_at_timestamp_limit = list(
            filter(lambda x: x["timestamp"] != limit_timestamp, partial_result)
        )
        result = result_without_events_at_timestamp_limit + events_at_timestamp_limit

    app.logger.debug(f"[Subgraph] Received unlocks: {result}")

    return result


def get_unlocks_by_timestamp_range(from_ts, to_ts) -> list[UnlockEvent]:
    query = gql(
        """
        query GetUnlocks($fromTimestamp: Int!, $toTimestamp: Int!) {
          unlockeds(
            first: 1000,
            skip: 0,
            orderBy: timestamp
            where: {timestamp_gte: $fromTimestamp, timestamp_lt: $toTimestamp}
          ) {
            __typename
            depositBefore
            amount
            timestamp
            user
            transactionHash
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
    result = gql_factory.build().execute(query, variable_values=variables)["unlockeds"]
    app.logger.debug(f"[Subgraph] Received unlocks: {result}")

    return result


def get_unlocks_by_address_and_timestamp_range(
    user_address: str, from_ts: int, to_ts: int
) -> list[UnlockEvent]:
    query = gql(
        """
        query GetUnlocks($userAddress: Bytes!, $fromTimestamp: Int!, $toTimestamp: Int!) {
          unlockeds(
            orderBy: timestamp
            where: {timestamp_gte: $fromTimestamp, timestamp_lt: $toTimestamp, user: $userAddress}
          ) {
            __typename
            depositBefore
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
        "fromTimestamp": from_ts,
        "toTimestamp": to_ts,
    }

    app.logger.debug(
        f"[Subgraph] Getting user {user_address} unlocks in timestamp range {from_ts} - {to_ts}"
    )
    result = gql_factory.build().execute(query, variable_values=variables)["unlockeds"]
    app.logger.debug(f"[Subgraph] Received unlocks: {result}")

    return result


def get_last_unlock_before(user_address: str, before: int) -> UnlockEvent | None:
    query = gql(
        """
        query GetUnlocks($userAddress: Bytes!, $beforeTimestamp: Int!) {
          unlockeds(
            orderBy: timestamp
            orderDirection: desc
            first: 1
            where: {user: $userAddress, timestamp_lt: $beforeTimestamp}
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
        "beforeTimestamp": before,
    }

    app.logger.debug(
        f"[Subgraph] Getting user {user_address} last unlock before {before}"
    )
    unlocks = gql_factory.build().execute(query, variable_values=variables)["unlockeds"]
    app.logger.debug(f"[Subgraph] Received unlocks: {unlocks}")

    return unlocks[0] if unlocks else None

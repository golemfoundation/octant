from datetime import timedelta

from config import Config
from gql import gql
from gql_integration.gql_factory import gql_factory
from gql_integration.gql_queries import GQLQueries
from helpers import cast_to_int


def get_unlocks(address: str, from_ts: int):
    query = gql(GQLQueries.GET_UNLOCKS)

    to_ts = Config.END_OF_PROMOTION_TS

    variables = {
        "fromTimestamp": from_ts,
        "toTimestamp": to_ts,
        "userAddress": address,
    }

    result = gql_factory.build().execute(query, variable_values=variables)
    unlockeds = result["unlockeds"]

    unlockeds = cast_to_int(unlockeds, "depositBefore", "amount")

    # for lock in unlockeds:
    #     lock["depositBefore"] = int(lock["depositBefore"])
    #     lock["amount"] = int(lock["amount"])
    return unlockeds


def get_locks(address: str, from_ts: int, latest_ts: int):
    query = gql(GQLQueries.GET_LOCKS)

    to_ts = latest_ts + int(
        timedelta(days=Config.DEADLINE_IN_DAYS).total_seconds()
    )

    variables = {
        "fromTimestamp": from_ts,
        "toTimestamp": to_ts,
        "userAddress": address,
    }
    result = gql_factory.build().execute(query, variable_values=variables)
    lockeds = result["lockeds"]

    lockeds = cast_to_int(lockeds, "depositBefore", "amount")
    # for lock in lockeds:
    #     lock["depositBefore"] = int(lock["depositBefore"])
    #     lock["amount"] = int(lock["amount"])

    return lockeds

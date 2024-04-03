from enum import StrEnum

from flask import current_app as app


class AccountAction(StrEnum):
    NORMAL = "txlist"
    INTERNAL = "txlistinternal"
    BEACON_WITHDRAWAL = "txsBeaconWithdrawal"


class BlockAction(StrEnum):
    BLOCK_NO_BY_TS = "getblocknobytime"
    BLOCK_REWARD = "getblockreward"


class ClosestValue(StrEnum):
    BEFORE = "before"
    AFTER = "after"


def obfuscate_url(api_url: str) -> str:
    return api_url.replace(app.config["ETHERSCAN_API_KEY"], "<API_KEY>")

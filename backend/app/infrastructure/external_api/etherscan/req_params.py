from enum import StrEnum


class AccountAction(StrEnum):
    NORMAL = "txlist"
    INTERNAL = "txlistinternal"
    BEACON_WITHDRAWAL = "txsBeaconWithdrawal"


class BlockAction(StrEnum):
    BLOCK = "getblocknobytime"


class ClosestValue(StrEnum):
    BEFORE = "before"
    AFTER = "after"

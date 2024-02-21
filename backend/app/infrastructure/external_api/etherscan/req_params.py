from enum import StrEnum


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

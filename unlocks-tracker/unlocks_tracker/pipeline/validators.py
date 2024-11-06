from schemas import (
    AccumulatedTransfersSchema,
    LockedsSchema,
    UnlockedsSchema,
    TransferDetailsSchema,
)


def check_if_locks_covers_transfers(
    acc_transfers: AccumulatedTransfersSchema,
    locks: LockedsSchema,
    error_margin: int = 0,
) -> bool:
    if locks is not None:
        acc_locks = sum(map(lambda lock: lock["amount"], locks))
    else:
        acc_locks = 0

    acc_transfers_amount = acc_transfers["value"]

    return acc_locks >= acc_transfers_amount - error_margin


def check_if_donation_is_decreased(
    locks: LockedsSchema,
    unlocks: UnlockedsSchema,
    transfer_details: TransferDetailsSchema,
    error_margin: int = 0,
):
    acc_locks = sum(map(lambda lock: lock["amount"], locks))
    acc_unlocks = sum(map(lambda unlock: unlock["amount"], unlocks))

    return (acc_locks - acc_unlocks) < (
        transfer_details["value"] - error_margin
    )

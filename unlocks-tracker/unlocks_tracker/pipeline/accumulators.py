from schemas import AccumulatedTransfersSchema, TransfersSchema


def accumulate_transfers(
    transfers: TransfersSchema,
) -> AccumulatedTransfersSchema:
    accumulated_transfers = {}
    for transfer in transfers:
        transfer_ts = int(transfer["timeStamp"])

        if transfer["to"] not in accumulated_transfers.keys():
            data = {
                "value": 0,
                "earliestTimestamp": transfer_ts,
                "from": [],
                "latestTimestamp": transfer_ts,
            }
            accumulated_transfers.update({transfer["to"]: data})

        accumulated_transfers[transfer["to"]]["value"] += int(
            transfer["value"]
        )
        accumulated_transfers[transfer["to"]]["from"].append(
            transfer["from"].lower()
        )

        if (
            transfer_ts
            < accumulated_transfers[transfer["to"]]["earliestTimestamp"]
        ):
            accumulated_transfers[transfer["to"]][
                "earliestTimestamp"
            ] = transfer_ts

        if (
            transfer_ts
            > accumulated_transfers[transfer["to"]]["latestTimestamp"]
        ):
            accumulated_transfers[transfer["to"]][
                "latestTimestamp"
            ] = transfer_ts

    return accumulated_transfers

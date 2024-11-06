from datetime import timedelta

from config import Config
from schemas import TransferDetailsSchema, TransfersSchema


def filter_outgoing_transfers(transfers: TransfersSchema) -> TransfersSchema:
    """
    Filters out transfers that are not GLM and are not sent
    to excluded addresses.
    """

    processed_transfers = []

    for transfer in transfers:
        if (
            transfer["tokenSymbol"] == "GLM"
            and transfer["to"].lower() not in Config.EXCLUDED_ADDRESSES
        ):
            processed_transfer = transfer.copy()
            processed_transfer["value"] = transfer["value"]
            processed_transfers.append(processed_transfer)

    return processed_transfers


def filter_transfers_to_organizations_only(transfers):
    return list(
        filter(
            lambda transfer: transfer["to"].lower()
            in Config.ORGANIZATIONS_ADDRESS,
            transfers,
        )
    )


def filter_transfers_from_organization(
    address: str,
    transfer_details: TransferDetailsSchema,
    transfers: TransfersSchema,
):
    deadline_ts = transfer_details["latestTimestamp"] + int(
        timedelta(days=Config.DEADLINE_IN_DAYS).total_seconds()
    )
    all_transfers_from_org = list(
        filter(
            lambda transfer: transfer["from"] == address
            and int(transfer["timeStamp"])
            > transfer_details["earliestTimestamp"]
            and int(int(transfer["timeStamp"]) <= deadline_ts),
            transfers,
        )
    )

    return all_transfers_from_org


def remove_redundancy(transfers):
    """
    Removes transfers that are sent to organizations or Golem addresses.
    """
    return list(
        filter(
            lambda transfer: transfer["to"].lower()
            not in Config.ORGANIZATIONS_ADDRESS
            and transfer["to"].lower() not in Config.GOLEM_ADDRESSES,
            transfers,
        )
    )

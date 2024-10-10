from config import Config
from constants import ReasonsForRemoving
from gql_integration.execution import get_locks, get_unlocks
from pipeline.accumulators import accumulate_transfers
from pipeline.daos import Context
from pipeline.validators import (
    check_if_donation_is_decreased,
    check_if_locks_covers_transfers,
)


class AccumulateAndCheckLocksStage:
    def execute(self, context: Context):
        all_outgoing_transfers_no_companies = (
            context.all_outgoing_transfers_no_companies
        )
        accumulated_transfers = accumulate_transfers(
            all_outgoing_transfers_no_companies
        )
        addresses_to_remove_from_allowlist = []

        for to_address, transfer_details in accumulated_transfers.items():
            locks = get_locks(
                to_address,
                transfer_details["earliestTimestamp"],
                transfer_details["latestTimestamp"],
            )

            if not locks or not check_if_locks_covers_transfers(
                transfer_details,
                locks,
                error_margin=(
                    100
                    if Config.KARLAGODETH_ADDRESS in transfer_details["from"]
                    else 0
                ),
            ):
                addresses_to_remove_from_allowlist.append(
                    {
                        "address": to_address,
                        "reason":
                            ReasonsForRemoving.TRANSFER_NOT_COVERED_BY_LOCKS,
                    }
                )
                continue

            unlocks = get_unlocks(
                to_address, transfer_details["earliestTimestamp"]
            )
            if unlocks and check_if_donation_is_decreased(
                locks, unlocks, transfer_details
            ):
                addresses_to_remove_from_allowlist.append(
                    {
                        "address": to_address,
                        "reason": ReasonsForRemoving.UNLOCKS_EXCEED_LOCKS,
                    }
                )

        print(
            "[DEBUG] Non-organization addresses "
            "to remove from the allow list.",
            "\n".join(
                map(
                    lambda entry: entry["address"] + entry["reason"],
                    addresses_to_remove_from_allowlist,
                )
            ),
        )

        context.addresses_to_remove_from_allowlist = (
            addresses_to_remove_from_allowlist
        )
        return context

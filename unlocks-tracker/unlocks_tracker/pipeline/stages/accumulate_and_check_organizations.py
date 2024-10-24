from constants import ReasonsForRemoving
from gql_integration.execution import get_locks, get_unlocks
from pipeline.accumulators import accumulate_transfers
from pipeline.daos import Context
from pipeline.filters import (
    filter_transfers_from_organization,
    filter_transfers_to_organizations_only,
)
from pipeline.validators import (
    check_if_donation_is_decreased,
    check_if_locks_covers_transfers,
)


class AccumulateAndCheckOrganizationsStage:
    def execute(self, context: Context):
        all_processed_outgoing_transfers = (
            context.from_partners_out_transfers
            + context.processed_golem_out_transfers
        )
        transfers_only_to_organizations = (
            filter_transfers_to_organizations_only(
                all_processed_outgoing_transfers
            )
        )
        accumulated_transfers_to_organizations_only = accumulate_transfers(
            transfers_only_to_organizations
        )

        organization_addresses_to_remove = []

        for (
            org_address,
            transfer_details,
        ) in accumulated_transfers_to_organizations_only.items():
            all_transfers_by_org = filter_transfers_from_organization(
                org_address, transfer_details, all_processed_outgoing_transfers
            )

            accumulated_transfer_by_org_only = accumulate_transfers(
                all_transfers_by_org
            )
            total_transfers = sum(
                map(
                    lambda transfer: transfer["value"],
                    accumulated_transfer_by_org_only.values(),
                )
            )

            locks = get_locks(
                org_address,
                transfer_details["earliestTimestamp"],
                transfer_details["latestTimestamp"],
            )

            if not check_if_locks_covers_transfers(
                transfer_details, locks, error_margin=total_transfers
            ):
                organization_addresses_to_remove.append(
                    {
                        "organization_address": org_address,
                        "reason":
                            ReasonsForRemoving.
                            ORG_TRANSFERS_NOT_COVERED_BY_LOCKS,
                    }
                )
                continue

            unlocks = get_unlocks(
                org_address, transfer_details["earliestTimestamp"]
            )
            if unlocks and check_if_donation_is_decreased(
                locks, unlocks, transfer_details, error_margin=total_transfers
            ):
                organization_addresses_to_remove.append(
                    {
                        "organization_address": org_address,
                        "reason": ReasonsForRemoving.UNLOCKS_EXCEED_LOCKS,
                    }
                )

        context.organization_addresses_to_remove = (
            organization_addresses_to_remove
        )
        return context

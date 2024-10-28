from dataclasses import dataclass
from typing import List, Set


@dataclass
class Context:
    processed_golem_out_transfers: List = None
    from_partners_out_transfers: List = None
    all_outgoing_transfers_no_companies: List = None
    not_present_original_list: Set = None
    addresses_to_remove_from_allowlist: List = None
    organization_addresses_to_remove: List = None


@dataclass
class SenderDetails:
    address: str
    start_block: int  # where we should start searching for transactions

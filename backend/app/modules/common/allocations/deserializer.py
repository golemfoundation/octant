from typing import Dict, List

from eth_utils import to_checksum_address

from app.engine.projects.rewards import AllocationItem
from app.modules.dto import UserAllocationRequestPayload, UserAllocationPayload


def deserialize_payload(payload: Dict) -> UserAllocationRequestPayload:
    allocation_payload = payload["payload"]
    allocation_items = deserialize_items(allocation_payload)
    nonce = int(allocation_payload["nonce"])
    signature = payload.get("signature")

    return UserAllocationRequestPayload(
        payload=UserAllocationPayload(allocation_items, nonce), signature=signature
    )


def deserialize_items(payload: Dict) -> List[AllocationItem]:
    return [
        AllocationItem(
            project_address=to_checksum_address(allocation_data["proposalAddress"]),
            amount=int(allocation_data["amount"]),
        )
        for allocation_data in payload["allocations"]
    ]

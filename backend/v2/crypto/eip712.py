from v2.allocations.schemas import UserAllocationRequest
from eth_account.messages import SignableMessage, _hash_eip191_message


def hash_signable_message(encoded_msg: SignableMessage) -> str:
    return "0x" + _hash_eip191_message(encoded_msg).hex()


def build_allocations_eip712_structure(chain_id: int, payload: UserAllocationRequest):
    message = {}
    message["allocations"] = [
        {"proposalAddress": a.project_address, "amount": a.amount}
        for a in payload.allocations
    ]
    message["nonce"] = payload.nonce  # type: ignore
    return build_allocations_eip712_data(chain_id, message)


def build_allocations_eip712_data(chain_id: int, message: dict) -> dict:
    # Convert amount value to int
    message["allocations"] = [
        {**allocation, "amount": int(allocation["amount"])}
        for allocation in message["allocations"]
    ]

    allocation_types = {
        "EIP712Domain": [
            {"name": "name", "type": "string"},
            {"name": "version", "type": "string"},
            {"name": "chainId", "type": "uint256"},
        ],
        "Allocation": [
            {"name": "proposalAddress", "type": "address"},
            {"name": "amount", "type": "uint256"},
        ],
        "AllocationPayload": [
            {"name": "allocations", "type": "Allocation[]"},
            {"name": "nonce", "type": "uint256"},
        ],
    }

    return {
        "types": allocation_types,
        "domain": {
            "name": "Octant",
            "version": "1.0.0",
            "chainId": chain_id,
        },
        "primaryType": "AllocationPayload",
        "message": message,
    }

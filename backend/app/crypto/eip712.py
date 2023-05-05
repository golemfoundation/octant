from eth_account import Account
from eth_account.messages import encode_structured_data

from app.extensions import w3
from app.settings import config

domain = {
    "name": "Octant",
    "version": "1.0.0",
    "chainId": config.CHAIN_ID,
}


def build_allocations_eip712_data(message: dict) -> dict:
    allocation_types = {
        "EIP712Domain": [
            {"name": "name", "type": "string"},
            {"name": "version", "type": "string"},
            {"name": "chainId", "type": "uint256"},
        ],
        "Allocation": [
            {"name": "proposalAddress", "type": "string"},
            {"name": "amount", "type": "uint256"},
        ],
        "AllocationPayload": [
            {"name": "allocations", "type": "Allocation[]"},
        ]
    }

    return {
        "types": allocation_types,
        "domain": domain,
        "primaryType": "AllocationPayload",
        "message": message
    }


def sign(account: Account, data: dict) -> str:
    """
    Signs the provided message with w3.eth.account following EIP-712 structure
    :returns signature as a hexadecimal string.
    """
    return account.sign_message(encode_structured_data(data)).signature.hex()


def recover_address(data: dict, signature: str) -> str:
    """
    Recovers the address from EIP-712 structured data
    :returns address as a hexadecimal string.
    """
    return w3.eth.account.recover_message(encode_structured_data(data), signature=signature)

from typing import Union

from eth_account import Account
from eth_account.signers.local import LocalAccount
from flask import current_app as app

from app.extensions import w3
from app.modules.dto import UserAllocationPayload
from app.modules.common.crypto.signature import encode_for_signing, EncodingStandardFor


def build_allocations_eip712_structure(payload: UserAllocationPayload):
    message = {}
    message["allocations"] = [
        {"proposalAddress": a.project_address, "amount": a.amount}
        for a in payload.allocations
    ]
    message["nonce"] = payload.nonce
    return build_allocations_eip712_data(message)


def build_allocations_eip712_data(message: dict) -> dict:
    domain = _build_domain()

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
        "domain": domain,
        "primaryType": "AllocationPayload",
        "message": message,
    }


def sign(account: Union[Account, LocalAccount], data: dict) -> str:
    """
    Signs the provided message with w3.eth.account following EIP-712 structure
    :returns signature as a hexadecimal string.
    """
    return account.sign_message(
        encode_for_signing(EncodingStandardFor.DATA, data)
    ).signature.hex()


def recover_address(data: dict, signature: str) -> str:
    """
    Recovers the address from EIP-712 structured data
    :returns address as a hexadecimal string.
    """
    return w3.eth.account.recover_message(
        encode_for_signing(EncodingStandardFor.DATA, data), signature=signature
    )


def _build_domain():
    return {
        "name": "Octant",
        "version": "1.0.0",
        "chainId": app.config["CHAIN_ID"],
    }

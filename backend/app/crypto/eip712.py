from typing import Union

from eth_account import Account
from eth_account.messages import encode_structured_data
from eth_account.signers.local import LocalAccount
from flask import current_app as app

from app.extensions import w3


def build_domain():
    return {
        "name": "Octant",
        "version": "1.0.0",
        "chainId": app.config["CHAIN_ID"],
    }


def build_allocations_eip712_data(message: dict) -> dict:
    domain = build_domain()

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
            {"name": "proposalAddress", "type": "string"},
            {"name": "amount", "type": "uint256"},
        ],
        "AllocationPayload": [
            {"name": "allocations", "type": "Allocation[]"},
        ],
    }

    return {
        "types": allocation_types,
        "domain": domain,
        "primaryType": "AllocationPayload",
        "message": message,
    }


def build_claim_glm_eip712_data() -> dict:
    domain = build_domain()

    claim_glm_types = {
        "EIP712Domain": [
            {"name": "name", "type": "string"},
            {"name": "version", "type": "string"},
            {"name": "chainId", "type": "uint256"},
        ],
        "ClaimGLMPayload": [
            {"name": "msg", "type": "string"},
        ],
    }

    return {
        "types": claim_glm_types,
        "domain": domain,
        "primaryType": "ClaimGLMPayload",
        "message": {
            "msg": f"Claim {int(app.config['GLM_WITHDRAWAL_AMOUNT'] / 1e18)} GLMs"
        },
    }


def sign(account: Union[Account, LocalAccount], data: dict) -> str:
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
    return w3.eth.account.recover_message(
        encode_structured_data(data), signature=signature
    )

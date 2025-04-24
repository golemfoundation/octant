import logging

from hexbytes import HexBytes
from web3 import AsyncWeb3

from app.constants import EIP1271_MAGIC_VALUE_BYTES
from app.modules.common.crypto.signature import EncodingStandardFor, encode_for_signing
from v2.allocations.schemas import UserAllocationRequest
from v2.crypto.eip712 import build_allocations_eip712_structure, hash_signable_message
from v2.core.types import Address
from v2.core.contracts import SmartContract


class SafeContracts(SmartContract):
    async def is_valid_signature(self, msg_hash: str, signature: str) -> bool:
        logging.info(
            f"[Gnosis Safe Contract] checking if a message with hash: {msg_hash} is already signed by {self.contract.address}"
        )

        result = await self.contract.functions.isValidSignature(
            msg_hash, signature
        ).call()
        return result == bytes.fromhex(EIP1271_MAGIC_VALUE_BYTES)

    async def get_message_hash(self, message: bytes) -> str:
        return await self.contract.functions.getMessageHash(message).call()


class SafeContractsFactory:
    def __init__(self, w3: AsyncWeb3, chain_id: int) -> None:
        self.w3 = w3
        self.chain_id = chain_id

    async def is_valid_signature(
        self, address: Address, msg_hash: str, signature: str
    ) -> bool:
        safe_contracts = SafeContracts(self.w3, GNOSIS_SAFE, address)
        return await safe_contracts.is_valid_signature(msg_hash, signature)

    async def get_message_hash(self, address: Address, message: str) -> str:
        """
        Based on safe message hash, get the message hash
        """
        safe_contracts = SafeContracts(self.w3, GNOSIS_SAFE, address)
        resp = await safe_contracts.get_message_hash(HexBytes(message))
        return f"0x{resp.hex()}"

    def get_safe_message_hash_for_allocation(
        self, payload: UserAllocationRequest
    ) -> str:
        """
        Builds the safe message hash for the allocation request
        """
        eip712_encoded = build_allocations_eip712_structure(self.chain_id, payload)
        encoded_msg = encode_for_signing(EncodingStandardFor.DATA, eip712_encoded)
        return hash_signable_message(encoded_msg)

    def get_safe_message_hash_for_tos(self, message: str) -> str:
        """
        Builds the safe message hash for the tos message
        """
        encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, message)
        return hash_signable_message(encoded_msg)


GNOSIS_SAFE = [
    {
        "inputs": [
            {"internalType": "bytes", "name": "_data", "type": "bytes"},
            {"internalType": "bytes", "name": "_signature", "type": "bytes"},
        ],
        "name": "isValidSignature",
        "outputs": [{"internalType": "bytes4", "name": "", "type": "bytes4"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "bytes", "name": "message", "type": "bytes"}],
        "name": "getMessageHash",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function",
    },
]

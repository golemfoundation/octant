import logging

from web3 import AsyncWeb3

from app.constants import EIP1271_MAGIC_VALUE_BYTES
from v2.core.types import Address
from v2.core.contracts import SmartContract


class GnosisSafeContracts(SmartContract):
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
    

class GnosisSafeContractsFactory:
    def __init__(self, w3: AsyncWeb3) -> None:
        self.w3 = w3

    def for_address(self, address: Address) -> GnosisSafeContracts:
        return GnosisSafeContracts(self.w3, GNOSIS_SAFE, address)


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

from flask import current_app as app

from app.constants import EIP1271_MAGIC_VALUE_BYTES
from app.infrastructure.contracts.smart_contract import SmartContract


class GnosisSafe(SmartContract):
    def is_valid_signature(self, msg_hash: str, signature: str) -> bool:
        app.logger.info(
            f"[Gnosis Safe Contract] checking if a message with hash: {msg_hash} is already signed by {self.contract.address}"
        )

        result = self.contract.functions.isValidSignature(msg_hash, signature).call()
        return result == bytes.fromhex(EIP1271_MAGIC_VALUE_BYTES)

    def get_message_hash(self, message: bytes) -> str:
        return self.contract.functions.getMessageHash(message).call()

from eth_account.messages import defunct_hash_message

from app.infrastructure.contracts import abi
from app.infrastructure.contracts.gnosis_safe import GnosisSafe
from app.extensions import w3


def is_valid_signature(address: str, message: str, signature: str) -> bool:
    contract = GnosisSafe(
        w3=w3, contact=w3.eth.contract(address=address, abi=abi.GNOSIS_SAFE)
    )
    msg_hash = defunct_hash_message(text=message)
    return contract.is_valid_signature(msg_hash.hex(), signature)

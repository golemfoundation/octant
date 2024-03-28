from app.infrastructure.contracts import abi
from app.infrastructure.contracts.gnosis_safe import GnosisSafe
from app.extensions import w3


def is_valid_signature(address: str, msg_hash: str, signature: str) -> bool:
    contract = GnosisSafe(
        w3=w3, contract=w3.eth.contract(address=address, abi=abi.GNOSIS_SAFE)
    )
    return contract.is_valid_signature(msg_hash, signature)

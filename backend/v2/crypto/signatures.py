from eth_account import Account
from eth_account.messages import SignableMessage, _hash_eip191_message
from eth_keys.exceptions import BadSignature
from eth_utils import to_checksum_address
from v2.crypto.contracts import GNOSIS_SAFE, GnosisSafeContracts
from web3 import AsyncWeb3
from web3.exceptions import ContractLogicError


async def verify_signed_message(
    w3: AsyncWeb3,
    user_address: str,
    encoded_msg: SignableMessage,
    signature: str,
) -> bool:
    contract = await is_contract(w3, user_address)
    if contract:
        return await _verify_multisig(w3, user_address, encoded_msg, signature)

    return _verify_eoa(user_address, encoded_msg, signature)


async def is_contract(w3: AsyncWeb3, address: str) -> bool:
    """
    Check if the given address is a contract.

    Args:
    - address (str): Ethereum address to check.
    """
    address = to_checksum_address(address)
    is_address = w3.is_address(address)

    if not is_address:
        raise ValueError(f"{address} is not a valid Ethereum address!")

    code = await w3.eth.get_code(address)

    return code.hex() != "0x"


def hash_signable_message(encoded_msg: SignableMessage) -> str:
    return "0x" + _hash_eip191_message(encoded_msg).hex()


async def _verify_multisig(
    w3: AsyncWeb3, user_address: str, encoded_msg: SignableMessage, signature: str
) -> bool:
    msg_hash = hash_signable_message(encoded_msg)
    try:
        gnosis_safe = GnosisSafeContracts(w3=w3, abi=GNOSIS_SAFE, address=user_address)
        return await gnosis_safe.is_valid_signature(msg_hash, signature)
    except ContractLogicError:
        return False


def _verify_eoa(
    user_address: str, encoded_msg: SignableMessage, signature: str
) -> bool:
    try:
        recovered_address = Account.recover_message(encoded_msg, signature=signature)
    except BadSignature:
        return False
    return recovered_address == user_address

from dataclasses import dataclass
from eth_account import Account
from eth_account.messages import SignableMessage
from eth_keys.exceptions import BadSignature
from eth_utils import to_checksum_address
from v2.crypto.eip712 import hash_signable_message
from v2.core.types import Address
from v2.multisig.contracts import GNOSIS_SAFE, SafeContracts
from web3 import AsyncWeb3
from web3.exceptions import ContractLogicError


@dataclass
class SignedMessageVerifier:
    w3: AsyncWeb3

    async def verify(
        self, user_address: Address, encoded_msg: SignableMessage, signature: str
    ) -> bool:
        return await verify_signed_message(
            self.w3, user_address, encoded_msg, signature
        )


async def verify_signed_message(
    w3: AsyncWeb3,
    user_address: Address,
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

    # EOA
    if code.hex() == "0x":
        return False

    # EIP-7702 delegate
    if code.hex().startswith("0xef0100") and len(code.hex()) == 48:
        return False

    # Otherwise assume a generic smart contract
    return True


async def _verify_multisig(
    w3: AsyncWeb3, user_address: Address, encoded_msg: SignableMessage, signature: str
) -> bool:
    msg_hash = hash_signable_message(encoded_msg)
    try:
        gnosis_safe = SafeContracts(w3=w3, abi=GNOSIS_SAFE, address=user_address)  # type: ignore[arg-type]
        return await gnosis_safe.is_valid_signature(msg_hash, signature)
    except ContractLogicError:
        return False


def _verify_eoa(
    user_address: Address, encoded_msg: SignableMessage, signature: str
) -> bool:
    try:
        recovered_address = Account.recover_message(encoded_msg, signature=signature)
    except BadSignature:
        return False
    return recovered_address == user_address
